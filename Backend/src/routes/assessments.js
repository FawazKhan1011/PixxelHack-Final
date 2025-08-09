import express from "express";
import { supabase } from "../db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Helper: calculate severity based on score and type
function calculateSeverity(type, score) {
  if (type === "PHQ-9") {
    if (score <= 4) return "None-minimal";
    if (score <= 9) return "Mild";
    if (score <= 14) return "Moderate";
    if (score <= 19) return "Moderately severe";
    return "Severe";
  }
  if (type === "GAD-7") {
    if (score <= 4) return "Minimal anxiety";
    if (score <= 9) return "Mild anxiety";
    if (score <= 14) return "Moderate anxiety";
    return "Severe anxiety";
  }
  return "Unknown";
}

// Submit an assessment
router.post("/", authenticateToken, async (req, res) => {
  const user_id = req.user.id;
  let { type, responses } = req.body;

  if (!type || !responses || !Array.isArray(responses)) {
    return res.status(400).json({ error: "Type and responses array required" });
  }

  type = type.trim().toUpperCase();

  if (!["PHQ-9", "GAD-7"].includes(type)) {
    return res.status(400).json({ error: "Invalid assessment type" });
  }

  const expectedLength = type === "PHQ-9" ? 9 : 7;
  if (responses.length !== expectedLength) {
    return res.status(400).json({ error: `Expected ${expectedLength} responses for ${type}` });
  }

  for (const val of responses) {
    if (![0, 1, 2, 3].includes(val)) {
      return res.status(400).json({ error: "Responses must be integers between 0 and 3" });
    }
  }

  const score = responses.reduce((acc, val) => acc + val, 0);
  const severity = calculateSeverity(type, score);

  const { data, error } = await supabase
    .from("assessments")
    .insert([{ user_id, type, responses, score, severity }])
    .select();

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: "Assessment recorded", assessment: data[0] });
});

// Get summary statistics for assessments (protected)
router.get("/summary", authenticateToken, async (req, res) => {
  const user_id = req.user.id;

  try {
    const { data: assessments, error } = await supabase
      .from("assessments")
      .select("*")
      .eq("user_id", user_id);

    if (error) return res.status(500).json({ error: error.message });

    if (!assessments.length) {
      return res.json({ message: "No assessments found for user", summary: {} });
    }

    const grouped = assessments.reduce((acc, assessment) => {
      const { type, score, severity, created_at } = assessment;
      if (!acc[type]) {
        acc[type] = {
          count: 0,
          totalScore: 0,
          latestSeverity: severity,
          latestCreatedAt: created_at,
        };
      }

      acc[type].count += 1;
      acc[type].totalScore += score;

      if (new Date(created_at) > new Date(acc[type].latestCreatedAt)) {
        acc[type].latestSeverity = severity;
        acc[type].latestCreatedAt = created_at;
      }

      return acc;
    }, {});

    const summary = {};
    for (const [type, stats] of Object.entries(grouped)) {
      summary[type] = {
        count: stats.count,
        averageScore: Number((stats.totalScore / stats.count).toFixed(2)),
        latestSeverity: stats.latestSeverity,
      };
    }

    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all assessments for user
router.get("/", authenticateToken, async (req, res) => {
  const user_id = req.user.id;

  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

// Get single assessment by ID
router.get("/:id", authenticateToken, async (req, res) => {
  const user_id = req.user.id;
  const { id } = req.params;

  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("id", id)
    .eq("user_id", user_id)
    .single();

  if (error) return res.status(404).json({ error: "Assessment not found" });

  res.json(data);
});

// Delete assessment by ID
router.delete("/:id", authenticateToken, async (req, res) => {
  const user_id = req.user.id;
  const { id } = req.params;

  const { data, error } = await supabase
    .from("assessments")
    .delete()
    .eq("id", id)
    .eq("user_id", user_id);

  if (error) return res.status(500).json({ error: error.message });

  if (!data || data.length === 0) {
    return res.status(404).json({ error: "Assessment not found or already deleted" });
  }

  res.json({ message: "Assessment deleted successfully" });
});

export default router;
