import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { supabase } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Get user profile (protected)
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, username, bio, avatar_url, preferences, created_at")
      .eq("id", req.user.id)
      .single();

    if (error) return res.status(500).json({ error: error.message });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile (protected)
router.patch("/", authenticateToken, async (req, res) => {
  const user_id = req.user.id;
  const { username, bio, avatar_url, preferences } = req.body;

  const updates = {};
  if (username !== undefined) updates.username = username;
  if (bio !== undefined) updates.bio = bio;
  if (avatar_url !== undefined) updates.avatar_url = avatar_url;
  if (preferences !== undefined) updates.preferences = preferences;

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", user_id)
    .select();

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: "Profile updated", user: data[0] });
});

// Register user
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  // Check if user already exists
  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    return res.status(500).json({ error: fetchError.message });
  }

  if (existingUser) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert([{ email, password: hashedPassword }]);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ message: "User registered successfully" });
});

// Login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !data) return res.status(400).json({ error: "Invalid credentials" });

  const match = await bcrypt.compare(password, data.password);
  if (!match) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: data.id, email: data.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});


router.get("/summary", authenticateToken, async (req, res) => {
  try {
    // You can call your assessment summary logic here:
    // For example, reuse the assessment router logic or query DB
    
    // Mock call example (replace with your actual code):
    const user_id = req.user.id;
    // Call assessment summary function or DB directly
    const summary = await getAssessmentSummary(user_id);
    
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/chat", authenticateToken, async (req, res) => {
  const { messages } = req.body; // messages: [{ role: "user", content: "Hello" }, ...]
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or whichever you prefer
      messages,
      max_tokens: 500,
    });

    const aiResponse = completion.choices[0].message;
    res.json({ response: aiResponse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post("/action-plan", authenticateToken, async (req, res) => {
  const { summary, goals } = req.body;
  if (!summary) {
    return res.status(400).json({ error: "Summary data is required" });
  }

  // Build prompt for AI:
  const prompt = `
Given this assessment summary:
${JSON.stringify(summary, null, 2)}

And these goals:
${goals || "No specific goals provided."}

Generate a personalized mental health action plan with clear steps and recommendations.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: "You are a helpful mental health assistant." },
                 { role: "user", content: prompt }],
      max_tokens: 700,
    });

    res.json({ actionPlan: completion.choices[0].message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


export default router;
