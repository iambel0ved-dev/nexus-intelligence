const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

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
        console.error("❌ Error fetching report:", error.message);
        return;
    }

    data.forEach(company => {
        console.log(`\n🏢 COMPANY: ${company.name}`);
        console.log(`🔗 URL: ${company.pricing_url}`);
        
        if (company.pricing_plans.length > 0) {
            console.table(company.pricing_plans);
        } else {
            console.log("   (No pricing data found yet)");
        }
    });

    console.log("\n------------------------------------------");
    console.log(`✅ Report complete. Total companies tracked: ${data.length}`);
}

generateIntelligenceReport();