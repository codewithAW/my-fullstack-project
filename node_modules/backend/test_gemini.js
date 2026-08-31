require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
  if (!process.env.GEMINI_API_KEY) {
    console.log("No key found in process.env");
    return;
  }
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = "Say hello";
    
    console.log("Calling Gemini API...");
    const result = await model.generateContent(prompt);
    console.log("Response:", result.response.text());
  } catch (e) {
    console.error("Gemini API Error details:", e.message || e);
    if (e.status) console.error("Status:", e.status);
    if (e.details) console.error("Details:", e.details);
  }
}

run();
