require('dotenv').config();
const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');
const { extractPricingData } = require('./services/aiService');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// THIS IS THE COMPARISON LOGIC BLOCK
async function detectPriceChanges(companyName, newPlans) {
    console.log(`\n--- 🔍 Checking ${companyName} ---`);
    
    const { data: company } = await supabase.from('companies').select('id').eq('name', companyName).single();
    if (!company) return console.error("❌ Company not found.");

    const { data: oldPlans } = await supabase.from('pricing_plans').select('plan_name, price_value').eq('company_id', company.id);

    console.log(`📊 DB Baseline: ${oldPlans.length} plans. Scraped: ${newPlans.length} plans.`);

    // Use a for...of loop instead of forEach to allow 'await' for sendAlert
    for (const newPlan of newPlans) {
        const match = oldPlans?.find(old => old.plan_name === newPlan.plan_name);
        
        if (match) {
            const oldPrice = parseFloat(match.price_value);
            const newPrice = parseFloat(newPlan.price_value);

            if (newPrice < oldPrice) {
                const dropMsg = `🚨 **PRICE DROP DETECTED** 🚨\n**${companyName}** dropped **${newPlan.plan_name}**\nFrom: $${oldPrice} ➔ To: $${newPrice}!`;
                console.log(dropMsg);
                await sendAlert(dropMsg); // <--- Triggers Discord
            } 
            else if (newPrice > oldPrice) {
                const hikeMsg = `📈 **PRICE INCREASE**\n**${companyName}** increased **${newPlan.plan_name}** to $${newPrice}.`;
                console.log(hikeMsg);
                await sendAlert(hikeMsg); // <--- Triggers Discord
            } 
            else {
                console.log(`✅ ${newPlan.plan_name} is stable at $${newPrice}.`);
            }
        } else {
            console.log(`✨ NEW PLAN: "${newPlan.plan_name}" at $${newPlan.price_value}`);
        }
    }

    // Save the new data as the baseline for next time
    const plansToUpsert = newPlans.map(plan => ({
        company_id: company.id,
        plan_name: plan.plan_name,
        price_value: String(plan.price_value),
        currency: plan.currency,
        target_audience: plan.target_audience
    }));

    await supabase.from('pricing_plans').upsert(plansToUpsert, { onConflict: 'company_id, plan_name' });
    console.log(`💾 Database updated.`);
}

async function sendAlert(message) {
    const url = process.env.DISCORD_WEBHOOK_URL;
    if (!url) return;

    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: message,
            username: "Nexus Intelligence Bot",
            avatar_url: "https://cdn-icons-png.flaticon.com/512/5822/5822025.png"
        })
    });
}

// THIS IS THE "WAIT FOR" FIX BLOCK
async function runTest() {
    const browser = await chromium.launch({ headless: true }); // Keep it headless for now
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 800 }
    });
    const page = await context.newPage();
    
    // Stealth Trick 1: Add extra headers
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/'
    });

    try {
        console.log("📡 Aggressive Navigation to OpenAI...");
        
        // 1. 'commit' is the fastest - it triggers as soon as the first byte arrives
        await page.goto("https://openai.com/api/pricing", { 
            waitUntil: 'commit', 
            timeout: 30000 
        });

        // 2. Instead of waiting for the network, we wait for a specific TIME
        console.log("⏳ Giving the page 15 seconds to force-load JS...");
        await page.waitForTimeout(15000); 

        // 3. Try to extract content twice - once raw, once from the inner container
        const bodyText = await page.evaluate(() => {
            return document.documentElement.innerText; // Grabs literally everything
        });

        console.log(`🤖 AI analyzing text (${bodyText.length} characters)...`);

        if (bodyText.length < 100) {
            console.error("❌ Still 0 characters. We are hard-blocked by the IP firewall.");
            console.log("💡 WORKAROUND: Try changing the URL in your code to a different page, like 'https://openai.com/pricing' (without the /api) to see if that path is open.");
            return;
        }

        const newPlans = await extractPricingData(bodyText);
        if (newPlans && newPlans.length > 0) {
            await detectPriceChanges("Openai", newPlans);
        }

    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await browser.close();
        console.log("🏁 Finished.");
    }
}

runTest();