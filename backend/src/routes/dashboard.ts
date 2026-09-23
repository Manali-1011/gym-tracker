import { Router } from "express";
import { authenticateUser, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", authenticateUser, async (req: AuthRequest, res) => {
  const supabase = req.supabase!;
  const userId = req.userId;

  // Get all workouts
  const { data: workouts, error: workoutError } = await supabase
    .from("workouts")
    .select("id, workout_date")
    .eq("user_id", userId);

  if (workoutError) {
    return res.status(500).json({
      success: false,
      error: workoutError.message,
    });
  }

  const workoutIds = workouts.map((workout) => workout.id);

  let totalExercises = 0;
  let totalVolume = 0;

  if (workoutIds.length > 0) {
    const { data: workoutExercises, error: exerciseError } =
      await supabase
        .from("workout_exercises")
        .select("id, workout_id")
        .in("workout_id", workoutIds);

    if (exerciseError) {
      return res.status(500).json({
        success: false,
        error: exerciseError.message,
      });
    }

    totalExercises = workoutExercises.length;

    const workoutExerciseIds = workoutExercises.map(
      (exercise) => exercise.id
    );

    if (workoutExerciseIds.length > 0) {
      const { data: sets, error: setsError } = await supabase
        .from("sets")
        .select("weight, reps")
        .in("workout_exercise_id", workoutExerciseIds);

      if (setsError) {
        return res.status(500).json({
          success: false,
          error: setsError.message,
        });
      }

      totalVolume = sets.reduce(
        (total, set) =>
          total + Number(set.weight) * Number(set.reps),
        0
      );
    }
  }

  // Count workouts completed this week
  const today = new Date();
  const day = today.getDay();

  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));

  const mondayDate = monday.toISOString().split("T")[0];

  const workoutsThisWeek = workouts.filter(
    (workout) => workout.workout_date >= mondayDate
  ).length;

  return res.json({
    success: true,
    data: {
      totalWorkouts: workouts.length,
      totalExercises,
      totalVolume,
      workoutsThisWeek,
    },
  });
});

export default router;