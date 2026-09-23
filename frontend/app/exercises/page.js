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
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export default function ExercisesPage() {
  const [exercises, setExercises] = useState([]);
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState("");
  const [equipment, setEquipment] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const loadExercises = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      window.location.href = "/login";
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/exercises`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "x-user-id": session.user.id,
        },
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        console.error("Add exercise failed:", result.error || response.status);
        return;
    }
    if (result.success) {
      setExercises(result.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadExercises();
  }, []);

  const addExercise = async (e) => {
    e.preventDefault();

    if (!name || !muscleGroup || !equipment) {
      return;
    }

    setAdding(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/exercises`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          "x-user-id": session.user.id,
        },
        body: JSON.stringify({
          name,
          muscle_group: muscleGroup,
          equipment,
        }),
      }
    );

    const result = await response.json();
 
    if (!response.ok || !result.success) {
        console.error("Add exercise failed:", result.error || response.status);
        return;
    } 

    if (result.success) {
      setExercises((current) => [result.data, ...current]);
      setName("");
      setMuscleGroup("");
      setEquipment("");
    }

    setAdding(false);
  };

  const deleteExercise = async (id) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/exercises/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "x-user-id": session.user.id,
        },
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        console.error("Add exercise failed:", result.error || response.status);
        return;
    }
    if (result.success) {
      setExercises((current) =>
        current.filter((exercise) => exercise.id !== id)
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f3f3] px-6 py-10 text-[#252525]">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Exercises</h1>
          <p className="mt-2 text-[#666666]">
            Add and manage your exercises.
          </p>
        </div>

        <Card className="border-[#dedede] bg-white">
          <CardHeader>
            <CardTitle>Add Exercise</CardTitle>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={addExercise}
              className="grid gap-4 md:grid-cols-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Exercise Name</Label>
                <Input
                  id="name"
                  placeholder="Bench Press"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="muscle">Muscle Group</Label>
                <Input
                  id="muscle"
                  placeholder="Chest"
                  value={muscleGroup}
                  onChange={(e) => setMuscleGroup(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="equipment">Equipment</Label>
                <Input
                  id="equipment"
                  placeholder="Barbell"
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={adding}
                  className="w-full bg-[#800020] hover:bg-[#650019]"
                >
                  {adding ? "Adding..." : "Add Exercise"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-[#dedede] bg-white">
          <CardHeader>
            <CardTitle>Your Exercises</CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <p className="text-[#666666]">Loading exercises...</p>
            ) : exercises.length === 0 ? (
              <p className="text-[#666666]">
                No exercises added yet.
              </p>
            ) : (
              <div className="space-y-3">
                {exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex items-center justify-between rounded-lg border border-[#dedede] p-4"
                  >
                    <div>
                      <h3 className="font-semibold">{exercise.name}</h3>
                      <p className="text-sm text-[#666666]">
                        {exercise.muscle_group} · {exercise.equipment}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => deleteExercise(exercise.id)}
                      className="border-[#dedede] text-[#800020] hover:bg-[#f7ecef]"
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}