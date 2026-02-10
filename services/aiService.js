const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extracts structured pricing data using Gemini 2.5 Flash-Lite
 * Optimized for 2026 rate limits and cost-efficiency.
 */
async function extractPricingData(htmlContent, retries = 3) {
    // Switch to the stable Lite model for 1,000 requests/day quota
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const prompt = `
        You are a pricing analyst. Extract all pricing plans from the following text.
        Return ONLY a JSON array of objects with these keys: 
        "plan_name", "price_value", "currency", "target_audience".
        
        If the price is 'Contact Us' or 'Custom', set price_value to 0.
        If no plans are found, return an empty array [].

        Text to analyze:
        ${htmlContent.substring(0, 20000)} 
    `;

    for (let i = 0; i < retries; i++) {
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Clean AI response to ensure it's valid JSON
            const jsonMatch = text.match(/\[.*\]/s);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : [];

        } catch (error) {
            if (error.status === 429) {
                const waitTime = (i + 1) * 15000; // Shorter 15s wait for Lite
                console.warn(`⚠️ Lite Rate Limit. Retrying in ${waitTime/1000}s...`);
                await new Promise(res => setTimeout(res, waitTime));
            } else {
                console.error("❌ AI Error:", error.message);
                return [];
            }
        }
    }
    return [];
}

module.exports = { extractPricingData };