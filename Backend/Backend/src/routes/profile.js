import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { supabase } from "../db.js";

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { data, error } = await supabase
      .from("users")
      .select("id, email, created_at")
      .eq("id", user_id)
      .single();

    if (error || !data) return res.status(404).json({ error: "User not found" });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
