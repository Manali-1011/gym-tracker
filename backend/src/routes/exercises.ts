import { Router } from "express";
import { supabase } from "../config/supabase";

const router = Router();

router.get("/", async (req, res) => {
  const userId = req.headers["x-user-id"] as string;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }

  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }

  return res.json({
    success: true,
    data,
  });
});

router.post("/", async (req, res) => {
  const userId = req.headers["x-user-id"] as string;
  const { name, muscle_group, equipment } = req.body;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }

  if (!name || !muscle_group || !equipment) {
    return res.status(400).json({
      success: false,
      error: "All exercise fields are required",
    });
  }

  const { data, error } = await supabase
    .from("exercises")
    .insert([
      {
        user_id: userId,
        name,
        muscle_group,
        equipment,
      },
    ])
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }

  return res.status(201).json({
    success: true,
    data,
  });
});

router.delete("/:id", async (req, res) => {
  const userId = req.headers["x-user-id"] as string;
  const exerciseId = req.params.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }

  const { error } = await supabase
    .from("exercises")
    .delete()
    .eq("id", exerciseId)
    .eq("user_id", userId);

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }

  return res.json({
    success: true,
    message: "Exercise deleted successfully",
  });
});

export default router;