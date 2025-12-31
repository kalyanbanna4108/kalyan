import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const HF_API_KEY = "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";

// Business knowledge base
const businessKnowledge = {
  company: "TechVision Solutions",
  services: ["AI Solutions", "Web Development", "Mobile Apps", "Cloud Services", "UI/UX Design", "Data Analytics"],
  email: "contact@techvision.com",
  phone: "+91 98765 43210",
  address: "123 Tech Park, Mumbai, India",
  hours: "Mon-Fri, 9:00 AM - 6:00 PM IST",
  founded: "2020",
  clients: "500+",
  pricing: {
    "AI Solutions": "Starting from ₹50,000",
    "Web Development": "Starting from ₹30,000",
    "Mobile Apps": "Starting from ₹1,00,000"
  }
};

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    // Enhanced system prompt for multilingual support
    const systemPrompt = `You are a helpful business AI assistant for TechVision Solutions. 
You MUST respond in the SAME language the user uses:
- If user writes in Hindi, respond in Hindi
- If user writes in English, respond in English  
- If user writes in Hinglish (mixed Hindi-English), respond in Hinglish

Company Information:
- Company: ${businessKnowledge.company}
- Services: ${businessKnowledge.services.join(", ")}
- Email: ${businessKnowledge.email}
- Phone: ${businessKnowledge.phone}
- Address: ${businessKnowledge.address}
- Hours: ${businessKnowledge.hours}
- Founded: ${businessKnowledge.founded}
- Clients Served: ${businessKnowledge.clients}

Pricing:
- AI Solutions: ${businessKnowledge.pricing["AI Solutions"]}
- Web Development: ${businessKnowledge.pricing["Web Development"]}
- Mobile Apps: ${businessKnowledge.pricing["Mobile Apps"]}

Keep responses concise, friendly, and helpful. Match the user's language style exactly.`;

    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
          "x-hf-provider": "fireworks-ai"
        },
        body: JSON.stringify({
          model: "deepseek-ai/DeepSeek-V3",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
          max_tokens: 300,
          temperature: 0.7
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error("HF API Error:", data);
      throw new Error("AI API request failed");
    }

    const reply = data?.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response. Please try again.";

    res.json({ reply });

  } catch (error) {
    console.error("HF ERROR:", error);
    res.status(500).json({ 
      reply: "AI service error. Please try again. / AI सेवा में त्रुटि। कृपया पुनः प्रयास करें।" 
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "AI Backend is running" });
});

app.listen(3000, () => {
  console.log("🤖 AI Server running on http://localhost:3000");
  console.log("📡 Endpoint: POST http://localhost:3000/chat");
});