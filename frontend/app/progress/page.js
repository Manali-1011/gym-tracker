"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export default function ProgressPage() {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProgress = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      window.location.href = "/login";
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/progress`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error("Progress failed:", result.error);
      setLoading(false);
      return;
    }

    setProgress(result.data);
    setLoading(false);
  };

  useEffect(() => {
    loadProgress();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f3f3f3] px-6 py-10">
        <p className="text-[#666666]">Loading progress...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f3f3] px-6 py-10 text-[#252525]">
      <div className="mx-auto max-w-6xl space-y-8">

        <div>
          <h1 className="text-3xl font-bold">
            Progress
          </h1>

          <p className="mt-2 text-[#666666]">
            Compare your recent exercise performance.
          </p>
        </div>

        {progress.length === 0 ? (
          <Card className="border-[#dedede] bg-white">
            <CardContent className="py-10 text-center">
              <p className="text-[#666666]">
                No progress data available yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {progress.map((item) => (
              <Card
                key={item.exercise}
                className="border-[#dedede] bg-white"
              >
                <CardHeader>
                  <CardTitle>
                    {item.exercise}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-5">

                  <div className="rounded-md bg-[#f7ecef] p-4">
                    <p className="text-sm text-[#666666]">
                      Status
                    </p>

                    <p className="mt-1 text-lg font-semibold text-[#800020]">
                      {item.status}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">

                    <div>
                      <p className="text-sm text-[#666666]">
                        Best Weight
                      </p>

                      <p className="text-xl font-bold">
                        {item.bestWeight} kg
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-[#666666]">
                        Best Reps
                      </p>

                      <p className="text-xl font-bold">
                        {item.bestReps}
                      </p>
                    </div>

                  </div>

                  {item.previous && (
                    <div className="border-t border-[#dedede] pt-4">
                      <p className="mb-3 font-medium">
                        Previous vs Current
                      </p>

                      <div className="grid grid-cols-2 gap-4">

                        <div>
                          <p className="text-sm text-[#666666]">
                            Previous 1RM
                          </p>

                          <p className="font-semibold">
                            {item.previous.estimated1RM} kg
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-[#666666]">
                            Current 1RM
                          </p>

                          <p className="font-semibold">
                            {item.current.estimated1RM} kg
                          </p>
                        </div>

                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}