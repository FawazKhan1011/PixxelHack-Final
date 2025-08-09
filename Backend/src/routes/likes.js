app.post("/api/projects/:id/like", async (req, res) => {
  const { user_id } = req.body;
  const { id } = req.params;

  if (!user_id) {
    return res.status(400).json({ error: "Missing user_id" });
  }

  try {
    const { data: existingLike, error: fetchError } = await supabase
      .from("likes")
      .select("*")
      .eq("project_id", id)
      .eq("user_id", user_id)
      .maybeSingle();

    console.log("existingLike:", existingLike);
    console.log("fetchError:", fetchError);

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
    console.error("Error in /like route:", err);
    res.status(500).json({ error: err.message });
  }
});
