require('dotenv').config();
const fs = require('fs');
const { chromium, firefox } = require('playwright'); // Added Firefox
const { createClient } = require('@supabase/supabase-js');
const { extractPricingData } = require('./services/aiService');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

function getCompanyName(url) {
    try {
        const hostname = new URL(url).hostname;
        const parts = hostname.replace('www.', '').split('.');
        let name = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        if (name === "Helpx" || name === "Docs") return "Adobe_Midjourney_Fix"; // Cleanup for those weird URLs
        return name;
    } catch (e) { return "Unknown"; }
}

async function runScraper() {
    const fileName = 'targets.json';
    const urls = JSON.parse(fs.readFileSync(fileName, 'utf8'));
    const allResults = {};

    // Launch both for versatility
    const chromeBrowser = await chromium.launch({ headless: true });
    const firefoxBrowser = await firefox.launch({ headless: true });

    // ... inside runScraper function loop ...

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
            
            // Wait for 'load' for these heavy sites to ensure images/tables are in place
            await page.goto(url, { waitUntil: 'load', timeout: 90000 });
            
            // Increased wait for heavy dynamic content (Adobe/AWS)
            console.log("⏳ Giving the page extra time to render...");
            await page.waitForTimeout(15000); 

            // Deeper scroll for AWS/Adobe long pages
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 3));
            await page.waitForTimeout(3000);
            await page.evaluate(() => window.scrollTo(0, (document.body.scrollHeight / 3) * 2));
            await page.waitForTimeout(3000);

            const bodyText = await page.evaluate(() => document.body.innerText);

            console.log(`🤖 AI analyzing...`);
            const pricingPlans = await extractPricingData(bodyText);

            if (pricingPlans && pricingPlans.length > 0) {
                // ... your existing DB logic ...
                console.log(`✅ ${companyName} synced successfully.`);
            }

            // THE CRITICAL FIX: 20-second pause AFTER each company
            // This prevents hitting the 15 requests per minute limit
            console.log("⏸️ Cooling down Gemini API (20s)...");
            await new Promise(r => setTimeout(r, 20000));

        } catch (err) {
            console.error(`❌ Error with ${companyName}:`, err.message);
        } finally {
            await page.close();
        }
    }
// ...

    await chromeBrowser.close();
    await firefoxBrowser.close();

    fs.writeFileSync('results.json', JSON.stringify(allResults, null, 2));
    console.log("\n✨ Mission Complete! Take that well-deserved break.");
}

runScraper();