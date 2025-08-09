import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { supabase } from "./db.js";
import authRoutes from "./routes/auth.js";
import { authenticateToken } from "./middleware/auth.js";
import profileRoutes from "./routes/profile.js";
import assessmentRoutes from "./routes/assessments.js";
import aiProxyRoutes from "./routes/aiProxy.js";



dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/profile", profileRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/ai", aiProxyRoutes);

// Auth routes
app.use("/api/auth", authRoutes);

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
 * Create a new project (protected)
 */
app.post("/api/projects", authenticateToken, async (req, res) => {
  const { title, description, image_url } = req.body;
  const user_id = req.user.id;  // get user id from JWT payload

  if (!title || !description) {
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
 * Update user profile (protected)
 */
app.patch("/api/profile", authenticateToken, async (req, res) => {
  const user_id = req.user.id;
  const { email, password } = req.body;

  const updates = {};
  if (email) updates.email = email;

  if (password) {
    // Hash new password before updating
    const hashedPassword = await bcrypt.hash(password, 10);
    updates.password = hashedPassword;
  }

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", user_id)
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Profile updated successfully", user: data[0] });
});

/**
 * Fetch all projects with like & comment counts (public)
 */
app.get("/api/projects", async (req, res) => {
  try {
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("*");

    if (projectsError) throw projectsError;

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
 * Like a project (protected)
 */
app.post("/api/projects/:id/like", authenticateToken, async (req, res) => {
  const user_id = req.user.id; // from token
  const { id } = req.params;

  try {
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
 * Add a comment (protected)
 */
app.post("/api/projects/:id/comment", authenticateToken, async (req, res) => {
  const user_id = req.user.id; // from token
  const { content } = req.body;
  const { id } = req.params;

  if (!content) {
    return res.status(400).json({ error: "Missing content" });
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
