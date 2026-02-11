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
    Extract AI API pricing from the provided text.
    Rules:
    1. "price_value" MUST be a pure number/decimal (e.g., 0.50). 
    2. REMOVE all currency symbols, letters (like 'p'), or percent signs from price_value.
    3. If a price is complex (e.g., "1.5% + 20p"), extract ONLY the primary numerical rate or set it to 0.
    4. Standardize all AI model prices to "Price per 1 Million Tokens".
    5. If the price is 'Contact Us' or 'Custom', set price_value to 0.

    Return ONLY a JSON array: 
    [{"plan_name": "string", "price_value": number, "currency": "USD"}]

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