"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      window.location.href = "/login";
      return;
    }

    const headers = {
      Authorization: "Bearer " + session.access_token,
    };

    // Load dashboard statistics
    const response = await fetch(
      process.env.NEXT_PUBLIC_API_URL + "/api/dashboard",
      {
        headers,
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error("Dashboard failed:", result.error);
      setLoading(false);
      return;
    }

    setStats(result.data);

    // Load workout streak
    const streakResponse = await fetch(
      process.env.NEXT_PUBLIC_API_URL + "/api/streak",
      {
        headers,
      }
    );

    const streakResult = await streakResponse.json();

    if (!streakResponse.ok || !streakResult.success) {
      console.error("Streak failed:", streakResult.error);
    } else {
      setStreak(streakResult.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f3f3f3] px-6 py-10">
        <p className="text-[#666666]">
          Loading dashboard...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f3f3] px-6 py-10 text-[#252525]">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">
            Dashboard
          </h1>

          <p className="mt-2 text-[#666666]">
            Track your workout activity and progress.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {/* Total Workouts */}
          <Card className="border-[#dedede] bg-white">
            <CardHeader>
              <CardTitle className="text-base">
                Total Workouts
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-3xl font-bold text-[#800020]">
                {stats.totalWorkouts}
              </p>
            </CardContent>
          </Card>

          {/* Exercises Performed */}
          <Card className="border-[#dedede] bg-white">
            <CardHeader>
              <CardTitle className="text-base">
                Exercises Performed
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-3xl font-bold text-[#800020]">
                {stats.totalExercises}
              </p>
            </CardContent>
          </Card>

          {/* Total Volume */}
          <Card className="border-[#dedede] bg-white">
            <CardHeader>
              <CardTitle className="text-base">
                Total Volume
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-3xl font-bold text-[#800020]">
                {stats.totalVolume}
              </p>

              <p className="mt-1 text-sm text-[#666666]">
                kg × reps
              </p>
            </CardContent>
          </Card>

          {/* This Week */}
          <Card className="border-[#dedede] bg-white">
            <CardHeader>
              <CardTitle className="text-base">
                This Week
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-3xl font-bold text-[#800020]">
                {stats.workoutsThisWeek}
              </p>

              <p className="mt-1 text-sm text-[#666666]">
                workouts completed
              </p>
            </CardContent>
          </Card>

          {/* Current Streak */}
          <Card className="border-[#dedede] bg-white">
            <CardHeader>
              <CardTitle className="text-base">
                🔥 Current Streak
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-3xl font-bold text-[#800020]">
                {streak?.currentStreak || 0}
              </p>

              <p className="mt-1 text-sm text-[#666666]">
                days
              </p>

              <p className="mt-3 text-sm text-[#666666]">
                Longest: {streak?.longestStreak || 0} days
              </p>
            </CardContent>
          </Card>

        </div>
      </div>
    </main>
  );
}
