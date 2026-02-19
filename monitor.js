require('dotenv').config();
const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const { extractPricingData } = require('./services/aiService');

// Initialize Clients
const supabase = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_SECRET_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

const wait = (ms) => new Promise(res => setTimeout(res, ms));

/**
 * Sends professional HTML email alerts via Resend
 */
async function sendPriceAlertEmails(companyName, planName, oldPrice, newPrice, subscribers) {
    const emails = subscribers.map(s => s.email);
    
    try {
        await resend.emails.send({
            from: 'Nexus Intelligence <alerts@nexus.intelligence.texrelay.site>',
            to: emails,
            subject: `[NEXUS] Price Shift Detected: ${companyName}`,
            html: `
                <div style="background-color: #050505; color: #ffffff; padding: 40px; font-family: sans-serif; border-radius: 8px;">
                    <h1 style="color: #3b82f6; letter-spacing: -1px; margin-bottom: 5px;">NEXUS INTELLIGENCE</h1>
                    <p style="color: #a1a1aa; font-size: 14px;">Strategic surveillance update for your monitored infrastructure.</p>
                    <hr style="border: 0; border-top: 1px solid #27272a; margin: 20px 0;" />
                    <div style="background: #0f172a; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 14px; color: #94a3b8;">Provider</p>
                        <h2 style="margin: 0 0 15px 0; color: #f8fafc;">${companyName}</h2>
                        <p style="margin: 5px 0;"><strong>Plan:</strong> ${planName}</p>
                        <p style="margin: 5px 0;"><strong>Shift:</strong> $${oldPrice} <span style="color: #10b981;">→ $${newPrice}</span></p>
                    </div>
                    <a href="https://nexus-intelligence-six.vercel.app/" style="display: inline-block; background: #ffffff; color: #000000; padding: 12px 24px; font-weight: bold; text-decoration: none; border-radius: 4px; margin-top: 10px;">Open Oracle Dashboard</a>
                    <p style="font-size: 10px; color: #52525b; margin-top: 40px; border-top: 1px solid #27272a; padding-top: 20px;">
                        Automated Intelligence by Abeeb Beloved Salam | Systems Architect 2026
                    </p>
                </div>
            `
        });
        console.log(`📧 Professional alerts dispatched to ${emails.length} subscribers.`);
    } catch (e) {
        console.error("❌ Resend dispatch failed:", e.message);
    }
}

/**
 * Sends immediate notification to the Discord Command Center
 */
async function sendDiscordAlert(message) {
    const url = process.env.DISCORD_WEBHOOK_URL;
    if (!url) return;
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: message, username: "Nexus Intelligence Bot" })
        });
        console.log("📡 Discord alert transmitted.");
    } catch (e) { 
        console.error("❌ Discord Alert Failed:", e.message); 
    }
}

/**
 * Logic to detect changes and trigger multi-channel alerts
 */
async function detectPriceChanges(companyName, newPlans) {
    const { data: company } = await supabase.from('companies').select('id').eq('name', companyName).single();
    if (!company) return;

    const { data: oldPlans } = await supabase.from('pricing_plans').select('plan_name, price_value').eq('company_id', company.id);

    for (const newPlan of newPlans) {
        const match = oldPlans?.find(old => old.plan_name === newPlan.plan_name);
        const newPrice = parseFloat(newPlan.price_value);

        // 1. Log to price_snapshots (Feeds your Analytics Charts)
        await supabase.from('price_snapshots').insert([{
            company_id: company.id,
            plan_name: newPlan.plan_name,
            price_value: newPrice,
            detected_at: new Date().toISOString()
        }]);

        if (match) {
            const oldPrice = parseFloat(match.price_value);
            
            if (newPrice < oldPrice) {
                console.log(`🎯 Market Opportunity Detected: ${companyName} price drop!`);

                // A. Discord Notification
                await sendDiscordAlert(`🚨 **PRICE DROP** [${companyName}]: ${newPlan.plan_name} fell from $${oldPrice} to $${newPrice}!`);

                // B. Email Notification to Subscribers
                const { data: subscribers } = await supabase
                    .from('price_subscriptions')
                    .select('email')
                    .eq('company_id', company.id);

                if (subscribers && subscribers.length > 0) {
                    await sendPriceAlertEmails(companyName, newPlan.plan_name, oldPrice, newPrice, subscribers);
                }
            }
        }
    }

    // 2. Sync the current state to pricing_plans
    const plansToUpsert = newPlans.map(plan => ({
        company_id: company.id,
        plan_name: plan.plan_name,
        price_value: String(plan.price_value),
        currency: plan.currency || 'USD'
    }));
    
    await supabase.from('pricing_plans').upsert(plansToUpsert, { onConflict: 'company_id, plan_name' });
}

/**
 * Main Orchestrator
 */
async function startMonitor() {
    console.log("🤖 NEXUS MONITOR: Initializing Surveillance...");
    
    const { data: companies } = await supabase.from('companies').select('*');
    if (!companies) return console.log("❌ Database unreachable. Check SUPABASE_SECRET_KEY.");
    
    const browser = await chromium.launch({ headless: true });

    for (const company of companies) {
        if (!company.pricing_url) continue;
        
        console.log(`📡 Scanning ${company.name}...`);
        const context = await browser.newContext();
        const page = await context.newPage();

        try {
            await page.goto(company.pricing_url, { waitUntil: 'domcontentloaded', timeout: 60000 });
            await wait(10000); // Allow JS to render pricing tables
            
            const text = await page.evaluate(() => document.documentElement.innerText);
            
            console.log(`⏳ AI Processing Cooldown (30s)...`);
            await wait(30000); 

            const plans = await extractPricingData(text);
            if (plans && plans.length > 0) {
                await detectPriceChanges(company.name, plans);
                console.log(`✅ ${company.name} data synchronized.`);
            }
        } catch (err) {
            console.error(`❌ Surveillance failed for ${company.name}:`, err.message);
        } finally {
            await context.close();
        }
    }
    
    await browser.close();
    console.log("🏁 Cycle Complete. All intelligence archived.");
}

startMonitor();