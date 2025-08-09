import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import assessmentRoutes from "./assessments.js"; // Router for assessments
import OpenAI from "openai";

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Mount assessment routes under /api/ai/assessments if needed
router.use("/assessments", authenticateToken, assessmentRoutes);

// Example route: Get assessment summary (delegating to assessmentRoutes or custom logic)
router.get("/summary", authenticateToken, async (req, res) => {
  try {
    // You can call the summary route internally or implement your own logic here
    // For example, call Supabase directly or reuse a helper function
    
    // Placeholder: Just returning a mock summary
    res.json({
      summary: {
        "PHQ-9": {
          count: 3,
          averageScore: 12.33,
          latestSeverity: "Moderate",
        },
        "GAD-7": {
          count: 1,
          averageScore: 8,
          latestSeverity: "Mild anxiety",
        },
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Example route: AI chat or action plan generation
router.post("/chat", authenticateToken, async (req, res) => {
  try {
    const { messages } = req.body; // e.g. [{ role: 'user', content: 'Hello' }]

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    res.json({ response: completion.choices[0].message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/action-plan", authenticateToken, async (req, res) => {
  try {
    const { type, score, severity } = req.body;

    if (!type || typeof score !== "number" || !severity) {
      return res.status(400).json({ error: "type, score, and severity are required" });
    }

    // Craft prompt for AI
    const prompt = `
You are a helpful assistant specialized in mental health support.

Given the following assessment results:

Assessment Type: ${type}
Score: ${score}
Severity: ${severity}

Generate a detailed, compassionate, and practical action plan that a person with these results can follow to improve their mental health. Include advice on when to seek professional help.

Provide the action plan in a clear, organized format.
`;

    // Call OpenAI Chat Completion
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful mental health assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const aiResponse = completion.choices[0].message.content;

    res.json({ response: { role: "assistant", content: aiResponse } });
  } catch (error) {
    console.error("Error generating action plan:", error);
    res.status(500).json({ error: "Failed to generate action plan" });
  }
});

// Export router
export default router;
