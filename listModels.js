require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function list() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent("Hi");
    console.log("✅ API Connection Success:", result.response.text());
  } catch (e) {
    console.log("❌ API Connection Failed. Check your key in .env");
    console.error(e.message);
  }
}
list();