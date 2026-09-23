"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

export default function NewWorkoutPage() {
  const [title, setTitle] = useState("");
  const [workoutDate, setWorkoutDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);

  const createWorkout = async (e) => {
    e.preventDefault();

    if (!title) return;

    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      window.location.href = "/login";
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/workouts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title,
          workout_date: workoutDate,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error(
        "Create workout failed:",
        result.error || response.status
      );
      setLoading(false);
      return;
    }

    console.log("Workout created:", result.data);

    window.location.href = "/workouts";
  };

  return (
    <main className="min-h-screen bg-[#f3f3f3] px-6 py-10 text-[#252525]">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">New Workout</h1>
          <p className="mt-2 text-[#666666]">
            Create a workout session and add exercises to it.
          </p>
        </div>

        <Card className="border-[#dedede] bg-white">
          <CardHeader>
            <CardTitle>Workout Details</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={createWorkout} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Workout Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Chest & Triceps"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Workout Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={workoutDate}
                  onChange={(e) => setWorkoutDate(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="bg-[#800020] hover:bg-[#650019]"
              >
                {loading ? "Creating..." : "Create Workout"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}