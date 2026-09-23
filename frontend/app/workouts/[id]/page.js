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

export default function WorkoutDetailsPage({ params }) {
  const [workoutId, setWorkoutId] = useState(null);
  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setWorkoutId(resolvedParams.id);
    };

    getParams();
  }, [params]);

  const loadData = async (id) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      window.location.href = "/login";
      return;
    }

    const headers = {
      Authorization: `Bearer ${session.access_token}`,
    };

    const workoutResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/workouts/${id}`,
      { headers }
    );

    const workoutResult = await workoutResponse.json();

    if (!workoutResponse.ok || !workoutResult.success) {
      console.error("Load workout failed:", workoutResult.error);
      setLoading(false);
      return;
    }

    const exerciseResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/exercises`,
      { headers }
    );

    const exerciseResult = await exerciseResponse.json();

    if (!exerciseResponse.ok || !exerciseResult.success) {
      console.error("Load exercises failed:", exerciseResult.error);
      setLoading(false);
      return;
    }

    setWorkout(workoutResult.data);
    setExercises(exerciseResult.data);
    setLoading(false);
  };

  useEffect(() => {
    if (workoutId) {
      loadData(workoutId);
    }
  }, [workoutId]);

  const addExercise = async () => {
    if (!selectedExercise || !workoutId) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/workouts/${workoutId}/exercises`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          exercise_id: selectedExercise,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error("Add exercise failed:", result.error);
      return;
    }

    setWorkout((current) => ({
      ...current,
      workout_exercises: [
        ...current.workout_exercises,
        {
          ...result.data,
          sets: [],
        },
      ],
    }));

    setSelectedExercise("");
  };

  const addSet = async (workoutExerciseId) => {
    if (!weight || !reps) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/workouts/${workoutId}/exercises/${workoutExerciseId}/sets`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          weight,
          reps,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error("Add set failed:", result.error);
      return;
    }

    setWorkout((current) => ({
      ...current,
      workout_exercises: current.workout_exercises.map((exercise) =>
        exercise.id === workoutExerciseId
          ? {
              ...exercise,
              sets: [...(exercise.sets || []), result.data],
            }
          : exercise
      ),
    }));

    setWeight("");
    setReps("");
  };
  
    const editSet = async (workoutExerciseId, setId, currentWeight, currentReps) => {
    const newWeight = window.prompt("Enter new weight:", currentWeight);
    const newReps = window.prompt("Enter new reps:", currentReps);

    if (newWeight === null || newReps === null) return;

    const {
        data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/workouts/${workoutId}/exercises/${workoutExerciseId}/sets/${setId}`,
        {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
            weight: newWeight,
            reps: newReps,
        }),
        }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
        console.error("Edit set failed:", result.error);
        return;
    }

    setWorkout((current) => ({
        ...current,
        workout_exercises: current.workout_exercises.map((exercise) =>
        exercise.id === workoutExerciseId
            ? {
                ...exercise,
                sets: exercise.sets.map((set) =>
                set.id === setId ? result.data : set
                ),
            }
            : exercise
        ),
    }));
    };
  const deleteSet = async (workoutExerciseId, setId) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/workouts/${workoutId}/exercises/${workoutExerciseId}/sets/${setId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error("Delete set failed:", result.error);
      return;
    }

    setWorkout((current) => ({
      ...current,
      workout_exercises: current.workout_exercises.map((exercise) =>
        exercise.id === workoutExerciseId
          ? {
              ...exercise,
              sets: exercise.sets.filter((set) => set.id !== setId),
            }
          : exercise
      ),
    }));
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f3f3f3] px-6 py-10">
        <p className="text-[#666666]">Loading workout...</p>
      </main>
    );
  }

  if (!workout) {
    return (
      <main className="min-h-screen bg-[#f3f3f3] px-6 py-10">
        <p>Workout not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f3f3] px-6 py-10 text-[#252525]">
      <div className="mx-auto max-w-5xl space-y-6">

        <div>
          <h1 className="text-3xl font-bold">{workout.title}</h1>
          <p className="mt-2 text-[#666666]">
            {workout.workout_date}
          </p>
        </div>

        <Card className="border-[#dedede] bg-white">
          <CardHeader>
            <CardTitle>Add Exercise</CardTitle>
          </CardHeader>

          <CardContent className="flex gap-3">
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="flex-1 rounded-md border border-[#dedede] bg-white px-3 py-2"
            >
              <option value="">Select an exercise</option>

              {exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name} — {exercise.muscle_group}
                </option>
              ))}
            </select>

            <Button
              onClick={addExercise}
              className="bg-[#800020] hover:bg-[#650019]"
            >
              Add Exercise
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {workout.workout_exercises?.map((item) => (
            <Card
              key={item.id}
              className="border-[#dedede] bg-white"
            >
              <CardHeader>
                <CardTitle>{item.exercises.name}</CardTitle>

                <p className="text-sm text-[#666666]">
                  {item.exercises.muscle_group} ·{" "}
                  {item.exercises.equipment}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">

                {/* Existing sets */}
                {item.sets?.length > 0 && (
                  <div className="space-y-2">
                    {item.sets.map((set, index) => (
                      <div
                        key={set.id}
                        className="flex items-center justify-between rounded-md border border-[#dedede] p-3"
                      >
                        <div>
                          <span className="font-medium">
                            Set {index + 1}
                          </span>

                          <span className="ml-4 text-[#666666]">
                            {set.weight} kg × {set.reps} reps
                          </span>
                        </div>

                        <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() =>
                            editSet(
                                item.id,
                                set.id,
                                set.weight,
                                set.reps
                            )
                            }
                            className="border-[#dedede]"
                        >
                            Edit
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() =>
                            deleteSet(item.id, set.id)
                            }
                            className="border-[#dedede] text-[#800020]"
                        >
                            Delete
                        </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add set */}
                <div className="flex gap-3">
                  <Input
                    type="number"
                    placeholder="Weight (kg)"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />

                  <Input
                    type="number"
                    placeholder="Reps"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                  />

                  <Button
                    onClick={() => addSet(item.id)}
                    className="bg-[#800020] hover:bg-[#650019]"
                  >
                    Add Set
                  </Button>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </main>
  );
}