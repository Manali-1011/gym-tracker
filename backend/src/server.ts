import { supabase } from "./config/supabase";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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