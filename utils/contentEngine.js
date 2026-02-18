const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * PHASE 6.3: Multi-Format Content Engine
 * Generates high-level strategic intelligence.
 */
async function generateGlobalInsights(historyData) {
    // Using 2.0 Flash for speed and high-quality reasoning
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-lite",
        generationConfig: { responseMimeType: "application/json" } // Forces JSON output
    });

    const prompt = `
        You are a Senior AI Systems Architect analyzing infrastructure pricing shifts.
        Data: ${JSON.stringify(historyData)}

        Analyze the trends and output a JSON object with these EXACT keys:
        {
          "tweet_templates": ["tweet 1", "tweet 2", "tweet 3"],
          "weekly_report_markdown": "A 3-paragraph strategic analysis using professional Markdown (headers, bolding). Focus on what this means for enterprise infra ROI.",
          "market_insight": "A 1-sentence punchy observation on provider behavior.",
          "call_to_action": "A professional closer highlighting that these autonomous systems can be built for the reader's firm."
        }
        
        Rules: 
        1. Do NOT include markdown blocks like \`\`\`json in the output.
        2. Tone: Professional, authoritative, and visionary.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    try {
        // Clean the string just in case the model ignored the config and added backticks
        const cleanedJson = responseText.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanedJson);
    } catch (e) {
        console.error("❌ Failed to parse AI Intelligence:", e.message);
        // Fallback object to prevent system crash
        return {
            tweet_templates: ["Market surveillance active. Trends stable."],
            weekly_report_markdown: "Analysis pending next data refresh.",
            market_insight: "Provider stability maintained across monitored nodes.",
            call_to_action: "Contact Abeeb Beloved Salam for infrastructure automation."
        };
    }
}

module.exports = { generateGlobalInsights };