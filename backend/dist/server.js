"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("./config/supabase");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const exercises_1 = __importDefault(require("./routes/exercises"));
const workouts_1 = __importDefault(require("./routes/workouts"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const progress_1 = __importDefault(require("./routes/progress"));
const streak_1 = __importDefault(require("./routes/streak"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/exercises", exercises_1.default);
app.use("/api/workouts", workouts_1.default);
app.use("/api/dashboard", dashboard_1.default);
app.use("/api/progress", progress_1.default);
app.use("/api/streak", streak_1.default);
app.get("/", (req, res) => {
    res.json({
        message: "Gym Tracker API is running"
    });
});
app.get("/api/test-db", async (req, res) => {
    const { data, error } = await supabase_1.supabase
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
