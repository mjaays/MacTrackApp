import { AppLayout } from '../components/AppLayout';
import '../styles/AddFood.css';
import { useState, useEffect } from 'react';
import { addFoodEntry } from '../services/api';

export default function AddFood() {

  const [food, setFood] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [message, setMessage] = useState('');

  const [dailySummary, setDailySummary] = useState<any>(null);
  const [foodsToday, setFoodsToday] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    setMessage('');

    try {

      // If API supports macros, pass them; otherwise, just calories
      const result = await addFoodEntry(food, Number(calories), Number(protein), Number(carbs), Number(fat));

      if (result.success) {

        setMessage(`Added ${food} (${calories} kcal)`);


        setFood('');
        setCalories('');
        setProtein('');
        setCarbs('');
        setFat('');

        fetchNutritionData();

      } else {

        setMessage(result.error?.message || 'Failed to add food entry.');

      }

    } catch {

      setMessage('Error adding food entry.');

    }

  };

  const fetchNutritionData = async () => {

    setLoading(true);

    // fake data
    const fakeSummary = {
      caloriesConsumed: 1320,
      calorieGoal: 2200,
      proteinG: 68,
      proteinGoal: 140,
      carbsG: 155,
      carbsGoal: 250,
      fatG: 42,
      fatGoal: 70,
    };

    const fakeFoods = [
      { id: '1', name: 'Oatmeal', caloriesKcal: 250, proteinG: 8, carbsG: 45, fatG: 4 },
      { id: '2', name: 'Chicken Breast', caloriesKcal: 180, proteinG: 32, carbsG: 0, fatG: 4 },
      { id: '3', name: 'Banana', caloriesKcal: 105, proteinG: 1, carbsG: 27, fatG: 0 },
    ];

    setTimeout(() => {

      setDailySummary(fakeSummary);
      setFoodsToday(fakeFoods);
      setLoading(false);

    }, 400);

  };

  useEffect(() => {

    fetchNutritionData();

  }, []);

  return (

    <AppLayout title="Add Food">

      <div className="add-food-container">

        {/* Header */}

        <header className="add-food-header">

          <div style={{ fontSize: 36 }}>🍎</div>

          <h2>Track Your Nutrition</h2>

          <p>Add foods and track your daily intake</p>

        </header>



        {/* Add Food Card */}
        <form className="add-food-form" onSubmit={handleSubmit}>
          <div className="add-food-form-header">Add Food</div>
          <div className="add-food-form-row">
            <input
              type="text"
              placeholder="Food name"
              value={food}
              onChange={(e) => setFood(e.target.value)}
              required
              style={{width: '100%'}}
            />
          </div>
          <div className="add-food-form-row">
            <input
              type="number"
              placeholder="Calories"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Protein (g)"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              min="0"
            />
          </div>
          <div className="add-food-form-row">
            <input
              type="number"
              placeholder="Carbs (g)"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              min="0"
            />
            <input
              type="number"
              placeholder="Fat (g)"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              min="0"
            />
          </div>
          <div className="add-food-form-row">
            <button type="submit" style={{width: '100%'}}>Add Food</button>
          </div>
        </form>


        {/* Nutrition Card */}


        {dailySummary && (
          <section className="nutrition-summary">
            <div className="nutrition-summary-header">Today's Nutrition</div>
            <div className="nutrition-macros-grid">
              <div className="nutrition-macro-label">🔥 Calories</div>
              <div className="nutrition-macro-value">{dailySummary.caloriesConsumed} / {dailySummary.calorieGoal} kcal</div>
              <div className="nutrition-macro-bar">
                <div className="nutrition-macro-bar-inner" style={{width: `${Math.min(100, Math.round((dailySummary.caloriesConsumed/dailySummary.calorieGoal)*100))}%`}} />
              </div>
              <div className="nutrition-macro-label">🥚 Protein</div>
              <div className="nutrition-macro-value">{dailySummary.proteinG} / {dailySummary.proteinGoal} g</div>
              <div className="nutrition-macro-bar">
                <div className="nutrition-macro-bar-inner" style={{width: `${Math.min(100, Math.round((dailySummary.proteinG/dailySummary.proteinGoal)*100))}%`}} />
              </div>
              <div className="nutrition-macro-label">🍚 Carbs</div>
              <div className="nutrition-macro-value">{dailySummary.carbsG} / {dailySummary.carbsGoal} g</div>
              <div className="nutrition-macro-bar">
                <div className="nutrition-macro-bar-inner" style={{width: `${Math.min(100, Math.round((dailySummary.carbsG/dailySummary.carbsGoal)*100))}%`}} />
              </div>
              <div className="nutrition-macro-label">🥑 Fat</div>
              <div className="nutrition-macro-value">{dailySummary.fatG} / {dailySummary.fatGoal} g</div>
              <div className="nutrition-macro-bar">
                <div className="nutrition-macro-bar-inner" style={{width: `${Math.min(100, Math.round((dailySummary.fatG/dailySummary.fatGoal)*100))}%`}} />
              </div>
            </div>
          </section>
        )}


        {/* Message */}

        {message && (

          <div className="add-food-message card">

            {message}

          </div>

        )}


        {/* Foods List Card */}

        <section className="foods-today-list card">

          <h3>Foods Eaten Today</h3>

          {loading ? (

            <p>Loading...</p>

          ) : (

            <ul>

              {foodsToday.map((food) => (

                <li key={food.id}>

                  <div className="food-name">

                    {food.name}

                  </div>

                  <div className="food-macros">

                    🔥 {food.caloriesKcal} kcal
                    &nbsp;&nbsp;
                    🥚 {food.proteinG}g
                    &nbsp;&nbsp;
                    🍚 {food.carbsG}g
                    &nbsp;&nbsp;
                    🥑 {food.fatG}g

                  </div>

                </li>

              ))}

            </ul>

          )}

        </section>

      </div>

    </AppLayout>

  );

}