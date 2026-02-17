const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * PHASE 6.3: Multi-Format Content Engine
 * Generates structured JSON for X, Reports, and Insights.
 */
async function generateGlobalInsights(historyData) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const prompt = `
        Analyze this AI pricing data from the last 30 days:
        ${JSON.stringify(historyData)}

        Output a JSON object with these EXACT keys:
        - tweet_templates: (Array of 3 punchy tweets about trends)
        - weekly_report_markdown: (A professional 3-paragraph summary)
        - market_insight: (A deep observation like 'Anthropic follows OpenAI within 48h')
        - call_to_action: (A hiring-focused closer)
    `;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text().replace(/```json|```/g, ""));
}

module.exports = { generateGlobalInsights };