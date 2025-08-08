import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { supabase } from "./db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Test DB connection
app.get("/api/test-db", async (req, res) => {
  const { data, error } = await supabase.from("users").select("*").limit(5);
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

/**
 * Create a new project
 */
app.post("/api/projects", async (req, res) => {
  const { title, description, image_url, user_id } = req.body;

  if (!title || !description || !user_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { data, error } = await supabase
    .from("projects")
    .insert([{ title, description, image_url, user_id }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

/**
 * Fetch all projects with like & comment counts
 */
app.get("/api/projects", async (req, res) => {
  try {
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("*");

    if (projectsError) throw projectsError;

    // For each project, get like & comment counts
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const { count: likeCount } = await supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project.id);

        const { count: commentCount } = await supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project.id);

        return {
          ...project,
          like_count: likeCount || 0,
          comment_count: commentCount || 0,
        };
      })
    );

    res.json(projectsWithCounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Like a project with duplicate check
 */
app.post("/api/projects/:id/like", async (req, res) => {
  const { user_id } = req.body;
  const { id } = req.params;

  if (!user_id) {
    return res.status(400).json({ error: "Missing user_id" });
  }

  try {
    // Check if the like already exists
    const { data: existingLike, error: fetchError } = await supabase
      .from("likes")
      .select("*")
      .eq("project_id", id)
      .eq("user_id", user_id)
      .maybeSingle();

    if (fetchError) {
      return res.status(500).json({ error: fetchError.message });
    }

    if (existingLike) {
      return res.status(400).json({ error: "Already liked" });
    }

    // Insert the new like only if not existing
    const { error: insertError } = await supabase
      .from("likes")
      .insert([{ project_id: id, user_id }]);

    if (insertError) {
      return res.status(500).json({ error: insertError.message });
    }

    res.json({ success: true, message: "Project liked" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * Add a comment
 */
app.post("/api/projects/:id/comment", async (req, res) => {
  const { user_id, content } = req.body;
  const { id } = req.params;

  if (!user_id || !content) {
    return res.status(400).json({ error: "Missing user_id or content" });
  }

  const { error } = await supabase
    .from("comments")
    .insert([{ project_id: id, user_id, content }]);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
