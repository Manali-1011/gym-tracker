import { Router } from "express";
import { authenticateUser, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", authenticateUser, async (req: AuthRequest, res) => {
  const supabase = req.supabase!;
  const userId = req.userId;

  const { data: workouts, error } = await supabase
    .from("workouts")
    .select("workout_date")
    .eq("user_id", userId)
    .order("workout_date", { ascending: true });

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }

  // Remove duplicate workout dates
  const uniqueDates = [
    ...new Set(
      (workouts || []).map((workout) => workout.workout_date)
    ),
  ].sort();

  if (uniqueDates.length === 0) {
    return res.json({
      success: true,
      data: {
        currentStreak: 0,
        longestStreak: 0,
      },
    });
  }

  let longestStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const previous = new Date(uniqueDates[i - 1]);
    const current = new Date(uniqueDates[i]);

    const difference =
      (current.getTime() - previous.getTime()) /
      (1000 * 60 * 60 * 24);

    if (difference === 1) {
      currentRun++;
      longestStreak = Math.max(longestStreak, currentRun);
    } else {
      currentRun = 1;
    }
  }

  // Calculate current streak from today backwards
  let currentStreak = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dateSet = new Set(uniqueDates);

  const latestWorkoutDate = new Date(
    uniqueDates[uniqueDates.length - 1]
  );

  latestWorkoutDate.setHours(0, 0, 0, 0);

  const daysSinceLatest =
    (today.getTime() - latestWorkoutDate.getTime()) /
    (1000 * 60 * 60 * 24);

  // A streak is active if the latest workout was today
  // or yesterday.
  if (daysSinceLatest <= 1) {
    let checkDate = new Date(latestWorkoutDate);

    while (true) {
      const dateString = checkDate
        .toISOString()
        .split("T")[0];

      if (!dateSet.has(dateString)) {
        break;
      }

      currentStreak++;

      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  return res.json({
    success: true,
    data: {
      currentStreak,
      longestStreak,
    },
  });
});

export default router;