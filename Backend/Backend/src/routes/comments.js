// routes/comments.js
import express from "express";
import { supabase } from "../supabaseClient.js";

const router = express.Router();

// Add a comment
router.post("/:id/comment", async (req, res) => {
  const { id } = req.params; // project ID
  const { user_id, content } = req.body; // user ID + comment text

  if (!user_id || !content) {
    return res.status(400).json({ error: "User ID and content are required" });
  }

  try {
    const { error } = await supabase
      .from("comments")
      .insert([{ project_id: id, user_id, content }]);

    if (error) throw error;

    res.json({ success: true, message: "Comment added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// In comments.js (same file)
router.get("/:id/comments", async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("comments")
      .select("*, users(username)")
      .eq("project_id", id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
