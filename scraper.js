require('dotenv').config();
const fs = require('fs');
const { chromium, firefox } = require('playwright'); 
const { createClient } = require('@supabase/supabase-js');
const { extractPricingData } = require('./services/aiService');
const { processPriceIntelligence } = require('./utils/intelligence');

// UPDATED: Using SECRET_KEY to ensure full database access for syncing
const supabase = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_SECRET_KEY
);

function getCompanyName(url) {
    try {
        const hostname = new URL(url).hostname;
        const parts = hostname.replace('www.', '').split('.');
        let name = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        if (name === "Helpx" || name === "Docs") return "Adobe_Midjourney_Fix"; 
        return name;
    } catch (e) { return "Unknown"; }
}

async function runScraper() {
    const fileName = 'targets.json';
    if (!fs.existsSync(fileName)) {
        console.error(`❌ ${fileName} not found!`);
        return;
    }
    const urls = JSON.parse(fs.readFileSync(fileName, 'utf8'));
    const allResults = {};

    const chromeBrowser = await chromium.launch({ headless: true });
    const firefoxBrowser = await firefox.launch({ headless: true });

    for (const url of urls) {
        const companyName = getCompanyName(url);
        console.log(`\n--- 🏢 ${companyName} ---`);
        
        const browser = (url.includes('adobe.com')) ? firefoxBrowser : chromeBrowser;
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        });

        const page = await context.newPage();
        try {
            console.log(`📡 Navigating to ${url}...`);
            await page.goto(url, { waitUntil: 'load', timeout: 90000 });
            
            console.log("⏳ Giving the page extra time to render...");
            await page.waitForTimeout(15000); 

            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 3));
            await page.waitForTimeout(3000);
            await page.evaluate(() => window.scrollTo(0, (document.body.scrollHeight / 3) * 2));
            await page.waitForTimeout(3000);

            const bodyText = await page.evaluate(() => document.body.innerText);

            console.log(`🤖 AI analyzing...`);
            const pricingPlans = await extractPricingData(bodyText);

            if (pricingPlans && pricingPlans.length > 0) {
                // Pass the high-privilege supabase client to the intelligence processor
                await processPriceIntelligence(supabase, companyName, pricingPlans, url);
                console.log(`✅ ${companyName} synced and intelligence processed.`);
            }

            console.log("⏸️ Cooling down Gemini API (20s)...");
            await new Promise(r => setTimeout(r, 20000));

        } catch (err) {
            console.error(`❌ Error with ${companyName}:`, err.message);
        } finally {
            await context.close();
        }
    }

    await chromeBrowser.close();
    await firefoxBrowser.close();

    fs.writeFileSync('results.json', JSON.stringify(allResults, null, 2));
    console.log("\n✨ Mission Complete! Take that well-deserved break.");
}

runScraper();