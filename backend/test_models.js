require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
  if (!process.env.GEMINI_API_KEY) {
    console.log("No key");
    return;
  }
  
  try {
    const fetch = require('node-fetch'); // or native fetch
  } catch(e) {}

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    console.log("Available models:", data.models?.map(m => m.name).join(', ') || data);
  } catch(e) {
    console.error("Error fetching models:", e.message || e);
  }
}

run();
