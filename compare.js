const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// UPDATED: Using SUPABASE_SECRET_KEY for full backend data access
const supabase = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_SECRET_KEY
);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateIntelligenceBriefing() {
    console.log("📊 Fetching market data from Supabase...");

    // 1. Pull everything from your DB
    const { data: companies, error: compError } = await supabase
        .from('companies')
        .select('*, pricing_plans(*)');

    if (compError || !companies) {
        console.error("❌ Failed to fetch data. Check your SUPABASE_SECRET_KEY.");
        return;
    }

    const marketContext = JSON.stringify(companies, null, 2);

    console.log("🧠 Sending data to Gemini 3 for Strategic Analysis...");

    // Staying with the 2026 flash model you specified
    const model = genAI.getGenerativeModel({ 
        model: "gemini-3-flash-preview",
        generationConfig: { temperature: 0.2 }
    });

    const prompt = `
    You are a Senior SaaS Pricing Consultant. I am providing you with raw pricing data for ${companies.length} companies:
    ${marketContext}

    Based on this 2026 market data, provide a Strategic Intelligence Briefing:
    1. MARKET POSITIONING: Who is the "Premium" leader vs the "Budget" alternative?
    2. THE "HIDDEN COST" AWARD: Which company has the most complex or potentially expensive usage-based pricing?
    3. BEST VALUE FOR STARTUPS: If I am a 5-person startup, which company should I choose and why?
    4. TREND ALERT: Identify one common pricing trend across these companies (e.g., AI premiums, credit systems).

    Format the output in clean Markdown.
    `;

    try {
        const result = await model.generateContent(prompt);
        console.log("\n--- NEXUS STRATEGIC BRIEFING --- \n");
        console.log(result.response.text());
    } catch (error) {
        console.error("💥 Analysis failed:", error.message);
    }
}

generateIntelligenceBriefing();