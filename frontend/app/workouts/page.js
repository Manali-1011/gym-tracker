"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWorkouts = async () => {
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
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error(
        "Load workouts failed:",
        result.error || response.status
      );
      setLoading(false);
      return;
    }

    setWorkouts(result.data);
    setLoading(false);
  };

  useEffect(() => {
    loadWorkouts();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f3f3f3] px-6 py-10 text-[#252525]">
        <div className="mx-auto max-w-5xl">
          <p className="text-[#666666]">Loading workouts...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f3f3] px-6 py-10 text-[#252525]">
      <div className="mx-auto max-w-5xl space-y-8">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Workouts</h1>
            <p className="mt-2 text-[#666666]">
              View and manage your workout sessions.
            </p>
          </div>

          <Button
            onClick={() => {
              window.location.href = "/workouts/new";
            }}
            className="bg-[#800020] hover:bg-[#650019]"
          >
            New Workout
          </Button>
        </div>

        {workouts.length === 0 ? (
          <Card className="border-[#dedede] bg-white">
            <CardContent className="py-10 text-center">
              <p className="text-[#666666]">
                No workouts yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {workouts.map((workout) => (
            <Card
                key={workout.id}
                className="cursor-pointer border-[#dedede] bg-white transition hover:border-[#800020]"
                onClick={() => {
                    window.location.href = `/workouts/${workout.id}`;
                }}
            >
                <CardHeader>
                  <CardTitle>{workout.title}</CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-[#666666]">
                    Date: {workout.workout_date}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}