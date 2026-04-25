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
  const [foodSearchDone, setFoodSearchDone] = useState(false)
  const [externalResults, setExternalResults] = useState<any[]>([])
  const [externalSearching, setExternalSearching] = useState(false)
  const [importingId, setImportingId] = useState<string | null>(null)

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
    setFoodSearchDone(false)
    setExternalResults([])
    try {
      const res = await foodApi.search(foodSearch)
      if (res.success) setSearchResults(res.data?.foods || res.data || [])
      else setSearchResults([])
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
      setFoodSearchDone(true)
    }
  }

  const handleSearchOnline = async () => {
    if (!foodSearch.trim()) return
    setExternalSearching(true)
    try {
      const res = await foodApi.searchExternal(foodSearch)
      if (res.success) setExternalResults(res.data || [])
    } catch {
      setExternalResults([])
    } finally {
      setExternalSearching(false)
    }
  }

  const selectExternalFood = async (food: any) => {
    setImportingId(food.externalId)
    try {
      const res = await foodApi.importExternal(food)
      if (res.success && res.data) {
        selectFood(res.data)
        setExternalResults([])
      }
    } catch {
      // fall through — user can still fill the form manually
    } finally {
      setImportingId(null)
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
    setFoodSearchDone(false)
  }

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm('Remove this meal entry?')) return
    try {
      await mealApi.delete(mealId)
      loadTodayData()
    } catch { /* ignore */ }
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
        ;(window as any).triggerGamificationCheck?.()
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
              placeholder="Search foods..."
              value={foodSearch}
              onChange={(e) => { setFoodSearch(e.target.value); setExternalResults([]); setFoodSearchDone(false) }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} disabled={searching}>
              {searching ? 'Searching...' : 'Search'}
            </button>
            <button
              onClick={handleSearchOnline}
              disabled={externalSearching || !foodSearch.trim()}
              className="search-online-btn"
              title="Search Open Food Facts database"
            >
              {externalSearching ? 'Searching...' : 'Search Online'}
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((food: any) => (
                <div key={food.id} className="search-result-item" onClick={() => selectFood(food)}>
                  <span className="food-name">{food.name}{food.brand ? ` (${food.brand})` : ''}</span>
                  <span className="food-info">{food.caloriesKcal} cal | P:{food.proteinG}g C:{food.carbsG}g F:{food.fatG}g</span>
                </div>
              ))}
            </div>
          )}
          {externalResults.length > 0 && (
            <div className="search-results external-results">
              <div className="external-results-label">Results from Open Food Facts</div>
              {externalResults.map((food: any) => (
                <div
                  key={food.externalId}
                  className="search-result-item"
                  onClick={() => importingId ? undefined : selectExternalFood(food)}
                  style={{ opacity: importingId === food.externalId ? 0.5 : 1, cursor: importingId ? 'wait' : 'pointer' }}
                >
                  <span className="food-name">{food.name}{food.brand ? ` (${food.brand})` : ''}</span>
                  <span className="food-info">
                    {importingId === food.externalId
                      ? 'Importing...'
                      : `${food.caloriesKcal} cal | P:${food.proteinG}g C:${food.carbsG}g F:${food.fatG}g (per 100g)`
                    }
                  </span>
                </div>
              ))}
            </div>
          )}
          {foodSearchDone && searchResults.length === 0 && externalResults.length === 0 && (
            <p className="food-search-empty">No local results found. Try the <strong>Search Online</strong> button to find foods from Open Food Facts.</p>
          )}
        </section>

        {/* Add Food Form */}
        <form className="add-food-form" onSubmit={handleSubmit}>
          <div className="add-food-form-header">Log Food</div>
          <div className="add-food-form-row">
            <input type="text" placeholder="Food name" value={name} onChange={(e) => { setName(e.target.value); setSelectedFoodId(null) }} required style={{ width: '100%' }} />
          </div>
          {selectedFoodId && (
            <div className="add-food-form-row">
              <p className="serving-size-info">1 serving = {servingSize}g &nbsp;·&nbsp; Adjust <strong>Servings</strong> below to match your portion</p>
            </div>
          )}
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
              {[
                { label: 'Calories', unit: 'kcal', data: goalComparison.calories, colorClass: '' },
                { label: 'Protein',  unit: 'g',    data: goalComparison.protein,  colorClass: 'protein' },
                { label: 'Carbs',    unit: 'g',    data: goalComparison.carbs,    colorClass: 'carbs' },
                { label: 'Fat',      unit: 'g',    data: goalComparison.fat,      colorClass: 'fat' },
              ].map(({ label, unit, data, colorClass }) => {
                const consumed = Number(data?.consumed ?? 0)
                const goal = data?.goal ? Number(data.goal) : null
                const pct = goal ? Math.min(100, Math.round((consumed / goal) * 100)) : null
                return (
                  <div key={label} style={{ display: 'contents' }}>
                    <div className="nutrition-macro-label">{label}</div>
                    <div className="nutrition-macro-value">
                      {label === 'Calories' ? consumed : consumed.toFixed(0)}
                      {goal ? ` / ${goal} ${unit}` : ` ${unit}`}
                      {pct !== null && <span className="nutrition-pct"> ({pct}%)</span>}
                    </div>
                    <div className="nutrition-macro-bar">
                      {pct !== null ? (
                        <div className={`nutrition-macro-bar-inner ${colorClass}`} style={{ width: `${pct}%` }} />
                      ) : (
                        <div className="nutrition-macro-bar-no-goal" />
                      )}
                    </div>
                  </div>
                )
              })}
              {!goalComparison.calories?.goal && (
                <div className="nutrition-no-goals">
                  Set your daily goals in <strong>Goals</strong> to track progress
                </div>
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
                  <div className="meal-item-header">
                    <div className="meal-type-badge">{meal.mealType}</div>
                    <button className="btn-delete-meal" onClick={() => handleDeleteMeal(meal.id)}>Delete</button>
                  </div>
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
