import { Router } from "express";
import { authenticateUser, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", authenticateUser, async (req: AuthRequest, res) => {
  const supabase = req.supabase!;
  const userId = req.userId;

  const { data, error } = await supabase
    .from("workout_exercises")
    .select(`
      id,
      exercise_id,
      workouts!inner (
        id,
        workout_date,
        user_id
      ),
      exercises!inner (
        id,
        name
      ),
      sets (
        weight,
        reps
      )
    `)
    .eq("workouts.user_id", userId)
    .order("workouts(workout_date)", { ascending: true });

  if (error) {
    console.error("Progress error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }

  const progressMap: Record<string, any> = {};

  for (const item of data || []) {
    const exerciseName = item.exercises.name;

    if (!progressMap[exerciseName]) {
      progressMap[exerciseName] = {
        exercise: exerciseName,
        sessions: [],
      };
    }

    const sets = item.sets || [];

    const bestWeight = sets.length
      ? Math.max(...sets.map((set) => Number(set.weight)))
      : 0;

    const bestReps = sets.length
      ? Math.max(...sets.map((set) => Number(set.reps)))
      : 0;

    const estimated1RM = sets.length
      ? Math.max(
          ...sets.map(
            (set) =>
              Number(set.weight) *
              (1 + Number(set.reps) / 30)
          )
        )
      : 0;

    progressMap[exerciseName].sessions.push({
      date: item.workouts.workout_date,
      bestWeight,
      bestReps,
      estimated1RM: Number(estimated1RM.toFixed(2)),
    });
  }

  const progress = Object.values(progressMap).map((exercise: any) => {
    const sessions = exercise.sessions;

    const current = sessions[sessions.length - 1];
    const previous =
      sessions.length > 1
        ? sessions[sessions.length - 2]
        : null;

    let status = "→ Maintained";

    if (previous && current.estimated1RM > previous.estimated1RM) {
      status = "↑ Improved";
    } else if (
      previous &&
      current.estimated1RM < previous.estimated1RM
    ) {
      status = "↓ Decreased";
    }

    return {
      exercise: exercise.exercise,
      previous,
      current,
      bestWeight: Math.max(
        ...sessions.map((session: any) => session.bestWeight)
      ),
      bestReps: Math.max(
        ...sessions.map((session: any) => session.bestReps)
      ),
      status,
    };
  });

  return res.json({
    success: true,
    data: progress,
  });
});

export default router;