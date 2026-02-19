const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// UPDATED: Using SUPABASE_SECRET_KEY for reliable backend access
const supabase = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_SECRET_KEY
);

async function generateIntelligenceReport() {
    console.log("📊 GENERATING NEXUS INTELLIGENCE REPORT...");
    console.log("------------------------------------------");

    // Fetch companies and their pricing plans using a Join
    const { data, error } = await supabase
        .from('companies')
        .select(`
            name,
            pricing_url,
            pricing_plans (
                plan_name,
                price_value,
                currency
            )
        `);

    if (error) {
        // Helpful tip: If this fails, it's usually because the Secret Key is missing 
        // or the URL in your .env is incorrect.
        console.error("❌ Error fetching report:", error.message);
        return;
    }

    data.forEach(company => {
        console.log(`\n🏢 COMPANY: ${company.name}`);
        console.log(`🔗 URL: ${company.pricing_url}`);
        
        if (company.pricing_plans && company.pricing_plans.length > 0) {
            console.table(company.pricing_plans);
        } else {
            console.log("   (No pricing data found yet)");
        }
    });

    console.log("\n------------------------------------------");
    console.log(`✅ Report complete. Total companies tracked: ${data?.length || 0}`);
}

generateIntelligenceReport();