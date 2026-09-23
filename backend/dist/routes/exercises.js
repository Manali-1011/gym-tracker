"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all exercises
router.get("/", auth_1.authenticateUser, async (req, res) => {
    const userId = req.userId;
    const supabase = req.supabase;
    const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
    if (error) {
        console.error("Get exercises error:", error);
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
// Add exercise
router.post("/", auth_1.authenticateUser, async (req, res) => {
    const userId = req.userId;
    const supabase = req.supabase;
    const { name, muscle_group, equipment } = req.body;
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
        console.error("Add exercise error:", error);
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
// Delete exercise
router.delete("/:id", auth_1.authenticateUser, async (req, res) => {
    const userId = req.userId;
    const supabase = req.supabase;
    const exerciseId = req.params.id;
    const { error } = await supabase
        .from("exercises")
        .delete()
        .eq("id", exerciseId)
        .eq("user_id", userId);
    if (error) {
        console.error("Delete exercise error:", error);
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
exports.default = router;
