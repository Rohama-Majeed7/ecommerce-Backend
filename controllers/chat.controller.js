import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GENAI_KEY );


const storeData = {
  greetings: [
    "Hello! Welcome to Meri Electric Shop. How can I assist you today?",
    "Hi there! Looking for something special? I'm here to help.",
    "Welcome! Feel free to ask about our products or orders."
  ],

  products: [
    { name: "Samsung Mobile", category: "Mobiles", price: "$250", inStock: true },
    { name: "iPhone XR", category: "Mobiles", price: "$350", inStock: false },
    { name: "Sony Smart TV", category: "Televisions", price: "$400", inStock: true },
    { name: "LG LED TV", category: "Televisions", price: "$300", inStock: false },
    { name: "Philips Trimmer", category: "Trimmers", price: "$120", inStock: true },
    { name: "OnePlus Buds", category: "AirPods", price: "$180", inStock: true }
  ],

  storeTimings: "10 AM to 10 PM"
};

const chat = async (req, res) => {
  const { message } = req.body; // Convert message to lowercase for better matching
console.log("message:",message);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // ✅ Greeting Handling
    if (message.includes("hello") || message.includes("hi") || message.includes("hey")) {
      const randomGreeting = storeData.greetings[Math.floor(Math.random() * storeData.greetings.length)];
      return res.json({ reply: randomGreeting });
    }

    // ✅ Product Inquiry Handling
    for (const product of storeData.products) {
      if (message.includes(product.name.toLowerCase()) || message.includes(product.category.toLowerCase())) {
        const stockMessage = product.inStock ? "Yes, it is available." : "Sorry, this product is currently out of stock.";
        return res.json({ reply: `${product.name} is available for ${product.price}. ${stockMessage}` });
      }
    }

    // ✅ Store Timing Inquiry
    if (message.includes("timing") || message.includes("hours") || message.includes("open")) {
      return res.json({ reply: `Our store operates from ${storeData.storeTimings}.` });
    }

    // ✅ Default Response for Unrelated Questions
    const systemMessage = `
      You are an AI assistant for "Meri Electric Shop". You should only answer questions about:
      - Our products (Mobiles, Televisions, Trimmers, AirPods)
      - Prices (between $100 - $400)
      - Stock availability
      - Store timings (10 AM to 10 PM)

      If a user asks about any other topic, reply with:
      "I can only answer questions related to our electronics store."
    `;

    // ✅ Send Message to Gemini AI for Answer
    const result = await model.generateContent([systemMessage, message]);
    const response = result.response.text();

    res.json({ reply: response });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ reply: "Sorry, I couldn't process your request." });
  }
};

export default chat;

