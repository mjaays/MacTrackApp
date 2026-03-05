import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const exercises = [
  // STRENGTH
  { name: 'Bench Press', category: 'STRENGTH', muscleGroups: 'Chest, Triceps, Shoulders', isWeighted: true, isBodyweight: false },
  { name: 'Incline Bench Press', category: 'STRENGTH', muscleGroups: 'Upper Chest, Shoulders', isWeighted: true, isBodyweight: false },
  { name: 'Squat', category: 'STRENGTH', muscleGroups: 'Quadriceps, Glutes, Hamstrings', isWeighted: true, isBodyweight: false },
  { name: 'Deadlift', category: 'STRENGTH', muscleGroups: 'Back, Hamstrings, Glutes', isWeighted: true, isBodyweight: false },
  { name: 'Overhead Press', category: 'STRENGTH', muscleGroups: 'Shoulders, Triceps', isWeighted: true, isBodyweight: false },
  { name: 'Barbell Row', category: 'STRENGTH', muscleGroups: 'Back, Biceps', isWeighted: true, isBodyweight: false },
  { name: 'Dumbbell Curl', category: 'STRENGTH', muscleGroups: 'Biceps', isWeighted: true, isBodyweight: false },
  { name: 'Tricep Dips', category: 'STRENGTH', muscleGroups: 'Triceps, Chest', isWeighted: false, isBodyweight: true },
  { name: 'Pull-ups', category: 'STRENGTH', muscleGroups: 'Back, Biceps', isWeighted: false, isBodyweight: true },
  { name: 'Push-ups', category: 'STRENGTH', muscleGroups: 'Chest, Triceps, Shoulders', isWeighted: false, isBodyweight: true },
  { name: 'Lat Pulldown', category: 'STRENGTH', muscleGroups: 'Back, Biceps', isWeighted: true, isBodyweight: false },
  { name: 'Leg Press', category: 'STRENGTH', muscleGroups: 'Quadriceps, Glutes', isWeighted: true, isBodyweight: false },
  { name: 'Lunges', category: 'STRENGTH', muscleGroups: 'Quadriceps, Glutes, Hamstrings', isWeighted: true, isBodyweight: false },
  { name: 'Calf Raises', category: 'STRENGTH', muscleGroups: 'Calves', isWeighted: true, isBodyweight: false },
  { name: 'Lateral Raises', category: 'STRENGTH', muscleGroups: 'Shoulders', isWeighted: true, isBodyweight: false },
  { name: 'Face Pulls', category: 'STRENGTH', muscleGroups: 'Rear Delts, Upper Back', isWeighted: true, isBodyweight: false },
  { name: 'Romanian Deadlift', category: 'STRENGTH', muscleGroups: 'Hamstrings, Glutes, Lower Back', isWeighted: true, isBodyweight: false },
  { name: 'Cable Fly', category: 'STRENGTH', muscleGroups: 'Chest', isWeighted: true, isBodyweight: false },

  // CARDIO
  { name: 'Running', category: 'CARDIO', muscleGroups: 'Legs, Core', caloriesPerMin: 10, isWeighted: false, isBodyweight: true },
  { name: 'Cycling', category: 'CARDIO', muscleGroups: 'Legs', caloriesPerMin: 8, isWeighted: false, isBodyweight: true },
  { name: 'Swimming', category: 'CARDIO', muscleGroups: 'Full Body', caloriesPerMin: 9, isWeighted: false, isBodyweight: true },
  { name: 'Jump Rope', category: 'CARDIO', muscleGroups: 'Legs, Shoulders', caloriesPerMin: 12, isWeighted: false, isBodyweight: true },
  { name: 'Rowing Machine', category: 'CARDIO', muscleGroups: 'Back, Legs, Arms', caloriesPerMin: 8, isWeighted: false, isBodyweight: true },
  { name: 'Walking', category: 'CARDIO', muscleGroups: 'Legs', caloriesPerMin: 4, isWeighted: false, isBodyweight: true },

  // FLEXIBILITY
  { name: 'Stretching', category: 'FLEXIBILITY', muscleGroups: 'Full Body', isWeighted: false, isBodyweight: true },
  { name: 'Yoga', category: 'FLEXIBILITY', muscleGroups: 'Full Body', caloriesPerMin: 4, isWeighted: false, isBodyweight: true },

  // BALANCE
  { name: 'Plank', category: 'BALANCE', muscleGroups: 'Core', isWeighted: false, isBodyweight: true },
  { name: 'Single Leg Balance', category: 'BALANCE', muscleGroups: 'Legs, Core', isWeighted: false, isBodyweight: true },
];

async function main() {
  console.log('Seeding exercises...');

  for (const exercise of exercises) {
    const existing = await prisma.exercise.findFirst({
      where: { name: exercise.name, isCustom: false },
    });
    if (!existing) {
      await prisma.exercise.create({
        data: {
          name: exercise.name,
          category: exercise.category,
          muscleGroups: exercise.muscleGroups,
          caloriesPerMin: exercise.caloriesPerMin,
          isWeighted: exercise.isWeighted,
          isBodyweight: exercise.isBodyweight,
          isCustom: false,
        },
      });
    }
  }

  console.log(`Seeded ${exercises.length} exercises.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
