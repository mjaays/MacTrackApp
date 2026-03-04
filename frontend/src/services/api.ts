const API_URL = "http://localhost:3000/api";

export const login = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return res.json();
};

export const addFoodEntry = async (
  food: string,
  calories: number,
  protein?: number,
  carbs?: number,
  fat?: number
) => {
  const body: any = { name: food, calories };
  if (typeof protein === 'number' && !isNaN(protein)) body.protein = protein;
  if (typeof carbs === 'number' && !isNaN(carbs)) body.carbs = carbs;
  if (typeof fat === 'number' && !isNaN(fat)) body.fat = fat;
  const res = await fetch(`${API_URL}/foods`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Add authentication header if needed
    },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  return res.json();
};