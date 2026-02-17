const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * PHASE 4: AI Market Analyst
 * Analyzes price changes to provide "The Why" for the dashboard.
 */
async function generateMarketInsight(eventData) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    const prompt = `
    Analyze this SaaS price change as a Market Intelligence Analyst:
    Provider: ${eventData.provider_name}
    Product: ${eventData.product_name}
    Change: $${eventData.old_price} -> $${eventData.new_price} (${eventData.delta_percentage}%)
    
    Provide a structured JSON response:
    {
        "market_impact": "One sentence professional analysis of why this matters.",
        "analyst_tone": "neutral/bullish/bearish",
        "category": "Price Hike/Price Drop/Correction"
    }`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{.*?\}/s);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
        console.error("❌ Analyst Insight Error:", e.message);
        return null;
    }
}

/**
 * PHASE 2, 4, & 5: Unified Intelligence Processor
 * Handles Snapshots, Delta calculation, AI Insights, and Twitter Intents.
 */
async function processPriceIntelligence(supabase, companyName, pricingPlans, sourceUrl) {
    for (const plan of pricingPlans) {
        const { plan_name, price_value, currency } = plan;
        
        // Ensure price is a clean number
        const numericPrice = typeof price_value === 'number' ? 
            price_value : 
            parseFloat(String(price_value).replace(/[^0-9.]/g, ''));

        if (isNaN(numericPrice)) continue;

        // 1. Fetch Company ID (Foreign Key Alignment)
        const { data: company } = await supabase
            .from('companies')
            .select('id')
            .ilike('name', `%${companyName}%`)
            .single();

        if (!company) {
            console.log(`⚠️ Company ${companyName} not found. Skipping...`);
            continue;
        }

        // 2. Fetch last snapshot for Delta comparison
        const { data: lastSnapshot } = await supabase
            .from('price_snapshots')
            .select('price_value')
            .eq('company_id', company.id)
            .eq('plan_name', plan_name)
            .order('detected_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        const oldPrice = lastSnapshot ? parseFloat(lastSnapshot.price_value) : null;

        // 3. Always log the snapshot for the history chart
        await supabase.from('price_snapshots').insert([{
            company_id: company.id,
            plan_name,
            price_value: numericPrice,
            currency: currency || 'USD',
            detected_at: new Date().toISOString()
        }]);

        // 4. If price changed, trigger Intelligence Layer
        if (oldPrice !== null && oldPrice !== numericPrice) {
            const delta = ((numericPrice - oldPrice) / oldPrice) * 100;
            const direction = numericPrice > oldPrice ? "📈 INCREASE" : "📉 DECREASE";
            
            // PHASE 5: Twitter Intent URL
            const tweetText = `Nexus Intelligence Alert: ${companyName} ${direction} for ${plan_name}.\nOld: $${oldPrice} -> New: $${numericPrice} (${delta.toFixed(1)}%)\n#AI #SaaS #MarketIntel`;
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

            // PHASE 4: AI Analysis
            const aiInsight = await generateMarketInsight({
                provider_name: companyName,
                product_name: plan_name,
                old_price: oldPrice,
                new_price: numericPrice,
                delta_percentage: delta.toFixed(1)
            });

            // Log to price_history
            await supabase.from('price_history').insert([{
                provider_name: companyName,
                product_name: plan_name,
                old_price: oldPrice,
                new_price: numericPrice,
                delta_percentage: delta.toFixed(2),
                source_url: sourceUrl,
                event_type: numericPrice > oldPrice ? 'price_hike' : 'price_drop',
                twitter_intents: { 
                    url: twitterUrl,
                    text: tweetText 
                },
                ai_analysis: aiInsight, // Storing Phase 4 data
                detected_at: new Date().toISOString()
            }]);
            
            console.log(`✨ Intelligence Event Logged: ${companyName} | ${plan_name} changed by ${delta.toFixed(1)}%`);
        }
    }
}
/**
 * PHASE 6: Discovery Filter
 * Identifies the most significant market shift from the last 24 hours.
 */
async function getHighImpactEvents(supabase) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
        .from('price_history')
        .select('*, ai_analysis')
        .gt('detected_at', twentyFourHoursAgo)
        .order('delta_percentage', { ascending: false });

    if (error || !data || data.length === 0) return null;

    // Return the event with the largest percentage change
    return data[0]; 
}

/**
 * PHASE 6: Social Payload Generator
 * Formats the event for LinkedIn/Twitter to drive traffic to your dashboard.
 */
function generateSocialPayload(event) {
    const { provider_name, product_name, old_price, new_price, delta_percentage, ai_analysis } = event;
    const direction = new_price < old_price ? "📉 PRICE DROP ALERT" : "📈 MARKET INCREASE";
    
    return {
        headline: `${direction}: ${provider_name}`,
        body: `${product_name} shifted from $${old_price} to $${new_price} (${delta_percentage}%).\n\nAnalyst Note: ${ai_analysis?.market_impact || "Significant infrastructure shift detected."}`,
        cta: "View the full surveillance live: [YOUR_DASHBOARD_URL]",
        tags: "#AI #SaaS #MarketIntelligence #NexusIntel"
    };
}

// Export the new functions
module.exports = { 
    processPriceIntelligence, 
    generateMarketInsight, 
    getHighImpactEvents, 
    generateSocialPayload 
};
