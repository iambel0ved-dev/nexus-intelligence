require('dotenv').config();
const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');
const { extractPricingData } = require('./services/aiService');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Helper for waiting
const wait = (ms) => new Promise(res => setTimeout(res, ms));

async function sendAlert(message) {
    const url = process.env.DISCORD_WEBHOOK_URL;
    if (!url) return;
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message, username: "Nexus Intelligence Bot" })
    });
}

async function detectPriceChanges(companyName, newPlans) {
    const { data: company } = await supabase.from('companies').select('id').eq('name', companyName).single();
    const { data: oldPlans } = await supabase.from('pricing_plans').select('plan_name, price_value').eq('company_id', company.id);

    for (const newPlan of newPlans) {
        const match = oldPlans?.find(old => old.plan_name === newPlan.plan_name);
        if (match) {
            const oldPrice = parseFloat(match.price_value);
            const newPrice = parseFloat(newPlan.price_value);
            if (newPrice < oldPrice) {
                await sendAlert(`🚨 **PRICE DROP** [${companyName}]: ${newPlan.plan_name} fell from $${oldPrice} to $${newPrice}!`);
            }
        } else {
            console.log(`✨ New plan found for ${companyName}: ${newPlan.plan_name}`);
        }
    }

    const plansToUpsert = newPlans.map(plan => ({
        company_id: company.id,
        plan_name: plan.plan_name,
        price_value: String(plan.price_value),
        currency: plan.currency || 'USD'
    }));
    await supabase.from('pricing_plans').upsert(plansToUpsert, { onConflict: 'company_id, plan_name' });
}

async function startMonitor() {
    const { data: companies } = await supabase.from('companies').select('*');
    const browser = await chromium.launch({ headless: true });

    console.log(`🚀 Starting monitor for ${companies.length} companies...`);

    for (const company of companies) {
        if (!company.pricing_url) continue;
        
        console.log(`📡 Scraping ${company.name}...`);
        const context = await browser.newContext();
        const page = await context.newPage();

        try {
            await page.goto(company.pricing_url, { waitUntil: 'domcontentloaded' });
            await wait(10000); // 10s for page to settle
            
            const text = await page.evaluate(() => document.documentElement.innerText);
            
            // GEMINI PROTECTION: Wait 30 seconds before calling the AI
            console.log(`⏳ Gemini Cooldown (30s)...`);
            await wait(30000); 

            const plans = await extractPricingData(text);
            if (plans && plans.length > 0) {
                await detectPriceChanges(company.name, plans);
                console.log(`✅ ${company.name} updated.`);
            }
        } catch (err) {
            console.error(`❌ Failed ${company.name}:`, err.message);
        } finally {
            await context.close();
        }
    }
    await browser.close();
    console.log("🏁 All companies finished.");
}

startMonitor();