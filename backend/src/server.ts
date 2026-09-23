import { supabase } from "./config/supabase";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import exerciseRoutes from "./routes/exercises";
import workoutRoutes from "./routes/workouts";
import dashboardRoutes from "./routes/dashboard";
import progressRoutes from "./routes/progress";
import streakRoutes from "./routes/streak";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/exercises", exerciseRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/streak", streakRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Gym Tracker API is running"
  });
});

app.get("/api/test-db", async (req, res) => {
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .limit(1);

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }

  return res.json({
    success: true,
    data
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});