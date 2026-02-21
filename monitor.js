require('dotenv').config();
const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');
const { extractPricingData } = require('./services/aiService');
const { processPriceIntelligence } = require('./utils/intelligence');

// Initialize Supabase Client
const supabase = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_SECRET_KEY
);

const wait = (ms) => new Promise(res => setTimeout(res, ms));

/**
 * Main Orchestrator for Automated Monitoring
 * This script now uses the centralized processPriceIntelligence utility.
 */
async function startMonitor() {
    console.log("🤖 NEXUS MONITOR: Initializing Surveillance...");
    
    const { data: companies, error } = await supabase.from('companies').select('*');
    
    if (error) {
        console.error("❌ Supabase connection failed:", error.message);
        console.error("Please ensure SUPABASE_URL and SUPABASE_SECRET_KEY are set correctly in your environment.");
        return; // Critical exit
    }

    if (!companies || companies.length === 0) {
        console.log("🤷 No companies found in the database. Exiting.");
        return;
    }
    
    console.log(`Found ${companies.length} companies to monitor.`);

    const browser = await chromium.launch({ headless: true });

    for (const company of companies) {
        if (!company.pricing_url) continue;
        
        console.log(`📡 Scanning ${company.name}...`);
        const context = await browser.newContext();
        const page = await context.newPage();

        try {
            // --- SCRAPING LOGIC (UNCHANGED) ---
            await page.goto(company.pricing_url, { waitUntil: 'domcontentloaded', timeout: 60000 });
            await wait(10000); // Allow JS to render pricing tables
            const text = await page.evaluate(() => document.documentElement.innerText);
            console.log(`⏳ AI Processing Cooldown (30s)...`);
            await wait(30000);
            const plans = await extractPricingData(text);
            // --- END OF SCRAPING LOGIC ---

            // --- DATA HANDLING (REFACTORED) ---
            if (plans && plans.length > 0) {
                // Using the centralized, correct intelligence processor
                await processPriceIntelligence(supabase, company.name, plans, company.pricing_url);
                console.log(`✅ ${company.name} data processed and synchronized.`);
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
