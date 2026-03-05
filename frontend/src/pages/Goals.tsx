import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { userApi } from '../services/api'
import { AppLayout } from '../components/AppLayout'
import '../styles/Goals.css'

const GOAL_TYPES = [
  { value: 'LOSE_WEIGHT', label: 'Lose Weight' },
  { value: 'MAINTAIN', label: 'Maintain Weight' },
  { value: 'GAIN_WEIGHT', label: 'Gain Weight' },
  { value: 'GAIN_MUSCLE', label: 'Gain Muscle' },
  { value: 'RECOMPOSITION', label: 'Body Recomposition' },
]

export function Goals() {
  const { user, refreshUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [calculations, setCalculations] = useState<any>(null)
  const [loadingCalc, setLoadingCalc] = useState(true)

  const [form, setForm] = useState({
    goalType: user?.goals?.goalType || 'MAINTAIN',
    targetWeightKg: user?.goals?.targetWeightKg || '',
    dailyCalorieTarget: user?.goals?.dailyCalories || '',
    dailyProteinG: user?.goals?.dailyProteinG || '',
    dailyCarbsG: user?.goals?.dailyCarbsG || '',
    dailyFatG: user?.goals?.dailyFatG || '',
  })

  useEffect(() => {
    loadCalculations()
  }, [])

  const loadCalculations = async () => {
    setLoadingCalc(true)
    try {
      const res = await userApi.getCalculations()
      if (res.success) setCalculations(res.data)
    } catch (err) {
      console.error('Failed to load calculations:', err)
    } finally {
      setLoadingCalc(false)
    }
  }

  const updateField = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const applyCalculated = () => {
    if (!calculations) return
    setForm(prev => ({
      ...prev,
      dailyCalorieTarget: Math.round(calculations.recommendedCalories) || prev.dailyCalorieTarget,
      dailyProteinG: Math.round(calculations.recommendedProteinG) || prev.dailyProteinG,
      dailyCarbsG: Math.round(calculations.recommendedCarbsG) || prev.dailyCarbsG,
      dailyFatG: Math.round(calculations.recommendedFatG) || prev.dailyFatG,
    }))
    setIsEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const body: Record<string, any> = {
        goalType: form.goalType,
      }
      if (form.targetWeightKg) body.targetWeightKg = Number(form.targetWeightKg)
      if (form.dailyCalorieTarget) body.dailyCalories = Number(form.dailyCalorieTarget)
      if (form.dailyProteinG) body.dailyProteinG = Number(form.dailyProteinG)
      if (form.dailyCarbsG) body.dailyCarbsG = Number(form.dailyCarbsG)
      if (form.dailyFatG) body.dailyFatG = Number(form.dailyFatG)

      const res = await userApi.updateGoals(body)
      if (res.success) {
        setMessage('Goals updated!')
        await refreshUser()
        setIsEditing(false)
      } else {
        setMessage(res.error?.message || 'Failed to update goals')
      }
    } catch {
      setMessage('Error updating goals')
    } finally {
      setSaving(false)
    }
  }

  const currentGoals = user?.goals

  return (
    <AppLayout title="Goals">
      <div className="goals-container">
        <header className="goals-page-header">
          <div>
            <h2>Nutrition Goals</h2>
            <p>Set your daily targets for calories and macronutrients</p>
          </div>
          <button className="btn-primary" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancel' : 'Edit Goals'}
          </button>
        </header>

        {message && <div className={`goals-message ${message.includes('updated') ? 'success' : 'error'}`}>{message}</div>}

        {/* Current Goals Display */}
        <div className="goals-grid">
          <div className="goal-card">
            <div className="goal-card-header">
              <h3>Goal Type</h3>
            </div>
            {isEditing ? (
              <select className="goal-select" value={form.goalType} onChange={(e) => updateField('goalType', e.target.value)}>
                {GOAL_TYPES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            ) : (
              <p className="goal-value">{GOAL_TYPES.find(g => g.value === currentGoals?.goalType)?.label || 'Not set'}</p>
            )}
          </div>

          <div className="goal-card">
            <div className="goal-card-header">
              <h3>Target Weight</h3>
            </div>
            {isEditing ? (
              <input type="number" className="goal-input" step="0.1" placeholder="kg" value={form.targetWeightKg} onChange={(e) => updateField('targetWeightKg', e.target.value)} />
            ) : (
              <p className="goal-value">{currentGoals?.targetWeightKg ? `${currentGoals.targetWeightKg} kg` : 'Not set'}</p>
            )}
          </div>

          <div className="goal-card highlight">
            <div className="goal-card-header">
              <h3>Daily Calories</h3>
            </div>
            {isEditing ? (
              <input type="number" className="goal-input" placeholder="kcal" value={form.dailyCalorieTarget} onChange={(e) => updateField('dailyCalorieTarget', e.target.value)} />
            ) : (
              <p className="goal-value big">{currentGoals?.dailyCalories || '--'} <span>kcal</span></p>
            )}
          </div>

          <div className="goal-card">
            <div className="goal-card-header">
              <h3>Daily Protein</h3>
            </div>
            {isEditing ? (
              <input type="number" className="goal-input" placeholder="grams" value={form.dailyProteinG} onChange={(e) => updateField('dailyProteinG', e.target.value)} />
            ) : (
              <p className="goal-value">{currentGoals?.dailyProteinG || '--'} <span>g</span></p>
            )}
          </div>

          <div className="goal-card">
            <div className="goal-card-header">
              <h3>Daily Carbs</h3>
            </div>
            {isEditing ? (
              <input type="number" className="goal-input" placeholder="grams" value={form.dailyCarbsG} onChange={(e) => updateField('dailyCarbsG', e.target.value)} />
            ) : (
              <p className="goal-value">{currentGoals?.dailyCarbsG || '--'} <span>g</span></p>
            )}
          </div>

          <div className="goal-card">
            <div className="goal-card-header">
              <h3>Daily Fat</h3>
            </div>
            {isEditing ? (
              <input type="number" className="goal-input" placeholder="grams" value={form.dailyFatG} onChange={(e) => updateField('dailyFatG', e.target.value)} />
            ) : (
              <p className="goal-value">{currentGoals?.dailyFatG || '--'} <span>g</span></p>
            )}
          </div>
        </div>

        {isEditing && (
          <button className="btn-save-goals" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Goals'}
          </button>
        )}

        {/* Calculated Recommendations */}
        {!loadingCalc && calculations && (
          <section className="calculated-section">
            <div className="calculated-header">
              <h3>Calculated Recommendations</h3>
              <p>Based on your profile (height, weight, age, activity level)</p>
            </div>
            <div className="calculated-grid">
              {calculations.bmr && (
                <div className="calc-item">
                  <span className="calc-label">BMR</span>
                  <span className="calc-value">{Math.round(calculations.bmr)} kcal</span>
                </div>
              )}
              {calculations.tdee && (
                <div className="calc-item">
                  <span className="calc-label">TDEE</span>
                  <span className="calc-value">{Math.round(calculations.tdee)} kcal</span>
                </div>
              )}
              {calculations.recommendedCalories && (
                <div className="calc-item highlight">
                  <span className="calc-label">Recommended Calories</span>
                  <span className="calc-value">{Math.round(calculations.recommendedCalories)} kcal</span>
                </div>
              )}
              {calculations.recommendedProteinG && (
                <div className="calc-item">
                  <span className="calc-label">Protein</span>
                  <span className="calc-value">{Math.round(calculations.recommendedProteinG)}g</span>
                </div>
              )}
              {calculations.recommendedCarbsG && (
                <div className="calc-item">
                  <span className="calc-label">Carbs</span>
                  <span className="calc-value">{Math.round(calculations.recommendedCarbsG)}g</span>
                </div>
              )}
              {calculations.recommendedFatG && (
                <div className="calc-item">
                  <span className="calc-label">Fat</span>
                  <span className="calc-value">{Math.round(calculations.recommendedFatG)}g</span>
                </div>
              )}
            </div>
            <button className="btn-apply" onClick={applyCalculated}>
              Apply Recommendations
            </button>
          </section>
        )}
      </div>
    </AppLayout>
  )
}
