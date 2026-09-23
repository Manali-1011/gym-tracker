"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);
      setLoading(false);
    };

    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f3f3f3] flex items-center justify-center">
        <p className="text-[#666666]">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f3f3]">
      {/* Navbar */}
      <nav className="bg-white border-b border-[#dedede]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="text-2xl font-bold text-[#800020]"
          >
            Gym Tracker
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-[#800020]"
            >
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="text-sm font-medium text-[#555555] hover:text-[#800020] transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-8">
          <p className="text-sm font-medium text-[#800020] mb-2">
            DASHBOARD
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-[#252525]">
            Welcome back!
          </h1>

          <p className="mt-2 text-[#666666]">
            {user?.email}
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Workouts */}
          <div className="bg-white border border-[#dedede] rounded-xl p-6 shadow-sm">
            <p className="text-sm text-[#666666]">
              Total Workouts
            </p>

            <h2 className="text-3xl font-bold text-[#800020] mt-3">
              0
            </h2>

            <p className="text-xs text-[#888888] mt-2">
              Completed workouts
            </p>
          </div>

          {/* Exercises */}
          <div className="bg-white border border-[#dedede] rounded-xl p-6 shadow-sm">
            <p className="text-sm text-[#666666]">
              Exercises Performed
            </p>

            <h2 className="text-3xl font-bold text-[#800020] mt-3">
              0
            </h2>

            <p className="text-xs text-[#888888] mt-2">
              Across all workouts
            </p>
          </div>

          {/* Volume */}
          <div className="bg-white border border-[#dedede] rounded-xl p-6 shadow-sm">
            <p className="text-sm text-[#666666]">
              Total Volume
            </p>

            <h2 className="text-3xl font-bold text-[#800020] mt-3">
              0 kg
            </h2>

            <p className="text-xs text-[#888888] mt-2">
              Weight × reps
            </p>
          </div>

          {/* This Week */}
          <div className="bg-white border border-[#dedede] rounded-xl p-6 shadow-sm">
            <p className="text-sm text-[#666666]">
              This Week
            </p>

            <h2 className="text-3xl font-bold text-[#800020] mt-3">
              0
            </h2>

            <p className="text-xs text-[#888888] mt-2">
              Workouts completed
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-8">
          {/* Recent Workouts */}
          <div className="bg-white border border-[#dedede] rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-[#252525]">
                Recent Workouts
              </h2>

              <span className="text-sm text-[#800020]">
                Coming soon
              </span>
            </div>

            <div className="border border-dashed border-[#d5d5d5] rounded-lg p-8 text-center">
              <p className="text-[#777777]">
                Your recent workouts will appear here.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-[#dedede] rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#252525] mb-5">
              Quick Actions
            </h2>

            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 rounded-lg bg-[#800020] text-white font-medium hover:bg-[#650019] transition">
                + Start New Workout
              </button>

              <button className="w-full text-left px-4 py-3 rounded-lg border border-[#d5d5d5] text-[#333333] hover:border-[#800020] hover:text-[#800020] transition">
                View Exercises
              </button>

              <button className="w-full text-left px-4 py-3 rounded-lg border border-[#d5d5d5] text-[#333333] hover:border-[#800020] hover:text-[#800020] transition">
                View Progress
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}