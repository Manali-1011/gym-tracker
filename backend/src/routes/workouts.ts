import { Router } from "express";
import { authenticateUser, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", authenticateUser, async (req: AuthRequest, res) => {
  const userId = req.userId;
  const supabase = req.supabase!;

  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", userId)
    .order("workout_date", { ascending: false });

  if (error) {
    console.error("Get workouts error:", error);
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

router.post("/", authenticateUser, async (req: AuthRequest, res) => {
  const userId = req.userId;
  const supabase = req.supabase!;

  const { title, workout_date } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      error: "Workout title is required",
    });
  }

  const { data, error } = await supabase
    .from("workouts")
    .insert([
      {
        user_id: userId,
        title,
        workout_date: workout_date || new Date().toISOString().split("T")[0],
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Create workout error:", error);
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

router.get("/:id", authenticateUser, async (req: AuthRequest, res) => {
  const userId = req.userId;
  const supabase = req.supabase!;
  const workoutId = req.params.id;

  const { data, error } = await supabase
    .from("workouts")
    .select(`
      id,
      title,
      workout_date,
      workout_exercises (
        id,
        exercise_id,
        order_index,
        exercises (
          name,
          muscle_group,
          equipment
        ),
        sets (
          id,
          weight,
          reps,
          set_order
        )
      )
    `)
    .eq("id", workoutId)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Get workout error:", error);
    return res.status(404).json({
      success: false,
      error: error.message,
    });
  }

  return res.json({
    success: true,
    data,
  });
});

router.post("/:id/exercises", authenticateUser, async (req: AuthRequest, res) => {
  const userId = req.userId;
  const supabase = req.supabase!;
  const workoutId = req.params.id;

  const { exercise_id } = req.body;

  if (!exercise_id) {
    return res.status(400).json({
      success: false,
      error: "Exercise is required",
    });
  }

  const { data: workout, error: workoutError } = await supabase
    .from("workouts")
    .select("id")
    .eq("id", workoutId)
    .eq("user_id", userId)
    .single();

  if (workoutError || !workout) {
    return res.status(404).json({
      success: false,
      error: "Workout not found",
    });
  }

  const { data, error } = await supabase
    .from("workout_exercises")
    .insert([
      {
        workout_id: workoutId,
        exercise_id,
      },
    ])
    .select(`
      id,
      exercise_id,
      order_index,
      exercises (
        name,
        muscle_group,
        equipment
      )
    `)
    .single();

  if (error) {
    console.error("Add workout exercise error:", error);
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

router.post(
  "/:workoutId/exercises/:workoutExerciseId/sets",
  authenticateUser,
  async (req: AuthRequest, res) => {
    const userId = req.userId;
    const supabase = req.supabase!;

    const { workoutId, workoutExerciseId } = req.params;
    const { weight, reps } = req.body;

    if (weight === undefined || reps === undefined) {
      return res.status(400).json({
        success: false,
        error: "Weight and reps are required",
      });
    }

    const { data: workoutExercise, error: verifyError } = await supabase
      .from("workout_exercises")
      .select(`
        id,
        workouts!inner(user_id)
      `)
      .eq("id", workoutExerciseId)
      .eq("workout_id", workoutId)
      .single();

    if (verifyError || !workoutExercise) {
      return res.status(404).json({
        success: false,
        error: "Workout exercise not found",
      });
    }

    const { data, error } = await supabase
      .from("sets")
      .insert([
        {
          workout_exercise_id: workoutExerciseId,
          weight: Number(weight),
          reps: Number(reps),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Add set error:", error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      data,
    });
  }
);

router.patch(
  "/:workoutId/exercises/:workoutExerciseId/sets/:setId",
  authenticateUser,
  async (req: AuthRequest, res) => {
    const supabase = req.supabase!;

    const { workoutId, workoutExerciseId, setId } = req.params;
    const { weight, reps } = req.body;

    const { data, error } = await supabase
      .from("sets")
      .update({
        weight: Number(weight),
        reps: Number(reps),
      })
      .eq("id", setId)
      .eq("workout_exercise_id", workoutExerciseId)
      .select()
      .single();

    if (error) {
      console.error("Update set error:", error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    return res.json({
      success: true,
      data,
    });
  }
);

router.delete(
  "/:workoutId/exercises/:workoutExerciseId/sets/:setId",
  authenticateUser,
  async (req: AuthRequest, res) => {
    const supabase = req.supabase!;

    const { setId, workoutExerciseId } = req.params;

    const { error } = await supabase
      .from("sets")
      .delete()
      .eq("id", setId)
      .eq("workout_exercise_id", workoutExerciseId);

    if (error) {
      console.error("Delete set error:", error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    return res.json({
      success: true,
      message: "Set deleted successfully",
    });
  }
);

export default router;