import { useState, useEffect } from 'react'
import { foodApi, mealApi, dashboardApi } from '../services/api'
import { AppLayout } from '../components/AppLayout'
import '../styles/AddFood.css'

const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']

export default function AddFood() {
  const [name, setName] = useState('')
  const [servingSize, setServingSize] = useState('100')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [mealType, setMealType] = useState('LUNCH')
  const [servings, setServings] = useState('1')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const [todaySummary, setTodaySummary] = useState<any>(null)
  const [todayMeals, setTodayMeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [foodSearch, setFoodSearch] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    loadTodayData()
  }, [])

  const loadTodayData = async () => {
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const [dashRes, mealsRes] = await Promise.all([
        dashboardApi.getToday(),
        mealApi.getAll(today, today),
      ])
      if (dashRes.success) setTodaySummary(dashRes.data)
      if (mealsRes.success) setTodayMeals(mealsRes.data || [])
    } catch (err) {
      console.error('Failed to load today data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!foodSearch.trim()) return
    setSearching(true)
    try {
      const res = await foodApi.search(foodSearch)
      if (res.success) setSearchResults(res.data || [])
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null)

  const selectFood = (food: any) => {
    setSelectedFoodId(food.id)
    setName(food.name)
    setCalories(String(food.caloriesKcal || food.caloriesPerServing || ''))
    setProtein(String(food.proteinG || ''))
    setCarbs(String(food.carbsG || ''))
    setFat(String(food.fatG || ''))
    setServingSize(String(food.servingSizeG || food.servingSize || 100))
    setSearchResults([])
    setFoodSearch('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    try {
      let foodId = selectedFoodId

      // Only create new food if we're not using an existing one
      if (!foodId) {
        const foodRes = await foodApi.create({
          name,
          servingSizeG: Number(servingSize) || 100,
          servingUnit: 'g',
          caloriesKcal: Number(calories),
          proteinG: Number(protein) || 0,
          carbsG: Number(carbs) || 0,
          fatG: Number(fat) || 0,
        })

        if (!foodRes.success) {
          setMessage(foodRes.error?.message || 'Failed to create food')
          setMessageType('error')
          return
        }
        foodId = foodRes.data.id
      }

      // Create a meal with this food
      const mealRes = await mealApi.create({
        mealType,
        loggedAt: new Date().toISOString(),
        entries: [{ foodId, servings: Number(servings) || 1 }],
      })

      if (mealRes.success) {
        setMessage(`Added ${name} to ${mealType.toLowerCase()}!`)
        setMessageType('success')
        setName('')
        setCalories('')
        setProtein('')
        setCarbs('')
        setFat('')
        setServings('1')
        setSelectedFoodId(null)
        loadTodayData()
      } else {
        setMessage(mealRes.error?.message || 'Failed to log meal')
        setMessageType('error')
      }
    } catch {
      setMessage('Error adding food entry')
      setMessageType('error')
    }
  }

  const goalComparison = todaySummary?.goalComparison

  return (
    <AppLayout title="Meals & Food">
      <div className="add-food-container">
        <header className="add-food-header">
          <h2>Track Your Nutrition</h2>
          <p>Search for foods or add new ones to log your meals</p>
        </header>

        {/* Food Search */}
        <section className="food-search-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search existing foods..."
              value={foodSearch}
              onChange={(e) => setFoodSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} disabled={searching}>
              {searching ? 'Searching...' : 'Search'}
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((food: any) => (
                <div key={food.id} className="search-result-item" onClick={() => selectFood(food)}>
                  <span className="food-name">{food.name}</span>
                  <span className="food-info">{food.caloriesKcal || food.caloriesPerServing} cal | P:{food.proteinG}g C:{food.carbsG}g F:{food.fatG}g</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Add Food Form */}
        <form className="add-food-form" onSubmit={handleSubmit}>
          <div className="add-food-form-header">Log Food</div>
          <div className="add-food-form-row">
            <input type="text" placeholder="Food name" value={name} onChange={(e) => { setName(e.target.value); setSelectedFoodId(null) }} required style={{ width: '100%' }} />
          </div>
          <div className="add-food-form-row">
            <div className="input-group">
              <label>Calories</label>
              <input type="number" placeholder="kcal" value={calories} onChange={(e) => setCalories(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Protein (g)</label>
              <input type="number" placeholder="0" value={protein} onChange={(e) => setProtein(e.target.value)} min="0" />
            </div>
          </div>
          <div className="add-food-form-row">
            <div className="input-group">
              <label>Carbs (g)</label>
              <input type="number" placeholder="0" value={carbs} onChange={(e) => setCarbs(e.target.value)} min="0" />
            </div>
            <div className="input-group">
              <label>Fat (g)</label>
              <input type="number" placeholder="0" value={fat} onChange={(e) => setFat(e.target.value)} min="0" />
            </div>
          </div>
          <div className="add-food-form-row">
            <div className="input-group">
              <label>Meal Type</label>
              <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
                {MEAL_TYPES.map(t => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Servings</label>
              <input type="number" value={servings} onChange={(e) => setServings(e.target.value)} min="0.5" step="0.5" />
            </div>
          </div>
          <div className="add-food-form-row">
            <button type="submit" style={{ width: '100%' }}>Add to Meal</button>
          </div>
        </form>

        {message && (
          <div className={`add-food-message ${messageType}`}>{message}</div>
        )}

        {/* Today's Nutrition Summary */}
        {goalComparison && (
          <section className="nutrition-summary">
            <div className="nutrition-summary-header">Today's Nutrition</div>
            <div className="nutrition-macros-grid">
              {goalComparison.calories && (
                <>
                  <div className="nutrition-macro-label">Calories</div>
                  <div className="nutrition-macro-value">{goalComparison.calories.consumed} / {goalComparison.calories.goal} kcal</div>
                  <div className="nutrition-macro-bar">
                    <div className="nutrition-macro-bar-inner" style={{ width: `${Math.min(100, goalComparison.calories.percentage)}%` }} />
                  </div>
                </>
              )}
              {goalComparison.protein && (
                <>
                  <div className="nutrition-macro-label">Protein</div>
                  <div className="nutrition-macro-value">{goalComparison.protein.consumed.toFixed(0)} / {goalComparison.protein.goal} g</div>
                  <div className="nutrition-macro-bar">
                    <div className="nutrition-macro-bar-inner protein" style={{ width: `${Math.min(100, goalComparison.protein.percentage)}%` }} />
                  </div>
                </>
              )}
              {goalComparison.carbs && (
                <>
                  <div className="nutrition-macro-label">Carbs</div>
                  <div className="nutrition-macro-value">{goalComparison.carbs.consumed.toFixed(0)} / {goalComparison.carbs.goal} g</div>
                  <div className="nutrition-macro-bar">
                    <div className="nutrition-macro-bar-inner carbs" style={{ width: `${Math.min(100, goalComparison.carbs.percentage)}%` }} />
                  </div>
                </>
              )}
              {goalComparison.fat && (
                <>
                  <div className="nutrition-macro-label">Fat</div>
                  <div className="nutrition-macro-value">{goalComparison.fat.consumed.toFixed(0)} / {goalComparison.fat.goal} g</div>
                  <div className="nutrition-macro-bar">
                    <div className="nutrition-macro-bar-inner fat" style={{ width: `${Math.min(100, goalComparison.fat.percentage)}%` }} />
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* Today's Meals */}
        <section className="foods-today-list">
          <h3>Today's Meals</h3>
          {loading ? (
            <p className="empty-state">Loading...</p>
          ) : todayMeals.length === 0 ? (
            <p className="empty-state">No meals logged today yet.</p>
          ) : (
            <div className="meals-list">
              {todayMeals.map((meal: any) => (
                <div key={meal.id} className="meal-item">
                  <div className="meal-type-badge">{meal.mealType}</div>
                  <div className="meal-entries">
                    {(meal.entries || []).map((entry: any) => (
                      <div key={entry.id} className="meal-entry">
                        <span className="food-name">{entry.food?.name || 'Unknown'}</span>
                        <span className="food-macros">
                          {entry.caloriesConsumed?.toFixed(0) || 0} cal | P:{entry.proteinConsumed?.toFixed(0) || 0}g C:{entry.carbsConsumed?.toFixed(0) || 0}g F:{entry.fatConsumed?.toFixed(0) || 0}g
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="meal-total">{meal.totalCalories?.toFixed(0) || 0} cal total</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  )
}
