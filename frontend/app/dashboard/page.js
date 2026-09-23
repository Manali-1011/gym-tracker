"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "../../lib/supabase";

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
      }
    };

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const stats = [
    {
      title: "Total Workouts",
      value: "0",
    },
    {
      title: "Exercises Performed",
      value: "0",
    },
    {
      title: "Total Volume",
      value: "0 kg",
    },
    {
      title: "Workouts This Week",
      value: "0",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f3f3f3]">
      <header className="border-b border-[#dedede] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-semibold text-[#252525]">
            Gym Tracker
          </h1>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-[#dedede] text-[#252525] hover:bg-[#f7ecef] hover:text-[#800020]"
          >
            Logout
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-[#252525]">
            Dashboard
          </h2>

          <p className="mt-2 text-[#666666]">
            Track your workouts and monitor your progress.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className="border-[#dedede] bg-white shadow-sm"
            >
              <CardHeader>
                <CardTitle className="text-sm font-medium text-[#666666]">
                  {stat.title}
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-3xl font-semibold text-[#800020]">
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}