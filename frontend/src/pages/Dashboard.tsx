import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { dashboardApi, workoutApi } from '../services/api'
import { AppLayout } from '../components/AppLayout'
import '../styles/Dashboard.css'

export function Dashboard() {
  const { user } = useAuth()
  const [todaySummary, setTodaySummary] = useState<any>(null)
  const [weeklySummary, setWeeklySummary] = useState<any>(null)
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const [todayRes, weeklyRes, workoutsRes] = await Promise.all([
        dashboardApi.getToday(),
        dashboardApi.getWeekly(),
        workoutApi.getAll(),
      ])
      if (todayRes.success) setTodaySummary(todayRes.data)
      if (weeklyRes.success) setWeeklySummary(weeklyRes.data)
      if (workoutsRes.success) setRecentWorkouts((workoutsRes.data || []).slice(0, 3))
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const navigate = (page: string) => (window as any).navigateTo(page)

  const summary = todaySummary?.summary
  const goalComparison = todaySummary?.goalComparison
  const weeklyDays = weeklySummary?.days || []
  const maxWeeklyCal = Math.max(...weeklyDays.map((d: any) => d.caloriesConsumed || 0), 1)

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    return `${diff} days ago`
  }

  const getDayLabel = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en', { weekday: 'short' })

  if (loading) {
    return (
      <AppLayout title="Dashboard">
        <div className="loading-state">Loading your dashboard...</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Dashboard">
      <div className="dashboard-grid">
        <div className="dashboard-greeting">
          <h3>Welcome back, {user?.firstName || 'there'}!</h3>
          <p>{new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>

        <section className="stats-section">
          <div className="stat-card">
            <div className="stat-icon calories-icon">&#x1F525;</div>
            <div className="stat-content">
              <p className="stat-label">Calories Today</p>
              <p className="stat-value">{summary?.caloriesConsumed || 0}</p>
              {goalComparison?.calories && (
                <p className="stat-period">of {goalComparison.calories.goal} goal</p>
              )}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon protein-icon">&#x1F95A;</div>
            <div className="stat-content">
              <p className="stat-label">Protein</p>
              <p className="stat-value">{summary?.proteinConsumed?.toFixed(0) || 0}g</p>
              {goalComparison?.protein && (
                <p className="stat-period">of {goalComparison.protein.goal}g goal</p>
              )}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon burn-icon">&#x1F4AA;</div>
            <div className="stat-content">
              <p className="stat-label">Burned</p>
              <p className="stat-value">{summary?.caloriesBurned || 0}</p>
              <p className="stat-period">calories today</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon net-icon">&#x1F3AF;</div>
            <div className="stat-content">
              <p className="stat-label">Net Calories</p>
              <p className="stat-value">{summary?.netCalories || 0}</p>
              <p className="stat-period">consumed - burned</p>
            </div>
          </div>
        </section>

        {goalComparison && (
          <section className="macro-progress">
            <h3>Today's Macros</h3>
            <div className="macro-bars">
              {goalComparison.calories && (
                <div className="macro-item">
                  <div className="macro-header">
                    <span>Calories</span>
                    <span>{goalComparison.calories.consumed} / {goalComparison.calories.goal}</span>
                  </div>
                  <div className="macro-bar"><div className="macro-fill cal-fill" style={{ width: `${Math.min(100, goalComparison.calories.percentage)}%` }}></div></div>
                </div>
              )}
              {goalComparison.protein && (
                <div className="macro-item">
                  <div className="macro-header">
                    <span>Protein</span>
                    <span>{goalComparison.protein.consumed.toFixed(0)}g / {goalComparison.protein.goal}g</span>
                  </div>
                  <div className="macro-bar"><div className="macro-fill protein-fill" style={{ width: `${Math.min(100, goalComparison.protein.percentage)}%` }}></div></div>
                </div>
              )}
              {goalComparison.carbs && (
                <div className="macro-item">
                  <div className="macro-header">
                    <span>Carbs</span>
                    <span>{goalComparison.carbs.consumed.toFixed(0)}g / {goalComparison.carbs.goal}g</span>
                  </div>
                  <div className="macro-bar"><div className="macro-fill carbs-fill" style={{ width: `${Math.min(100, goalComparison.carbs.percentage)}%` }}></div></div>
                </div>
              )}
              {goalComparison.fat && (
                <div className="macro-item">
                  <div className="macro-header">
                    <span>Fat</span>
                    <span>{goalComparison.fat.consumed.toFixed(0)}g / {goalComparison.fat.goal}g</span>
                  </div>
                  <div className="macro-bar"><div className="macro-fill fat-fill" style={{ width: `${Math.min(100, goalComparison.fat.percentage)}%` }}></div></div>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="recent-workouts">
          <h3>Recent Workouts</h3>
          {recentWorkouts.length === 0 ? (
            <p className="empty-state">No workouts yet. Start your first workout!</p>
          ) : (
            <div className="workout-list">
              {recentWorkouts.map((w: any) => (
                <div key={w.id} className="workout-item">
                  <div className="workout-info">
                    <h4>{w.name || w.workoutType}</h4>
                    <p>{w.entries?.length || 0} exercises{w.durationMin ? ` \u2022 ${w.durationMin} min` : ''}</p>
                  </div>
                  <div className="workout-stats">
                    <span className="badge">{w.totalCaloriesBurned || 0} cal</span>
                    <span className="date">{formatDate(w.startedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="weekly-activity">
          <h3>Weekly Calories</h3>
          {weeklyDays.length > 0 ? (
            <div className="activity-chart">
              {weeklyDays.map((day: any, i: number) => (
                <div key={i} className="activity-bar-wrapper">
                  <span className="bar-value">{day.caloriesConsumed || 0}</span>
                  <div className="activity-bar" style={{ height: `${Math.max(5, ((day.caloriesConsumed || 0) / maxWeeklyCal) * 100)}%` }}></div>
                  <span className="day">{getDayLabel(day.date)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No data for this week yet.</p>
          )}
        </section>

        <section className="quick-actions">
          <h3>Quick Actions</h3>
          <button className="action-btn primary" onClick={() => navigate('workouts')}>Log Workout</button>
          <button className="action-btn secondary" onClick={() => navigate('addfood')}>Log Meal</button>
          <button className="action-btn secondary" onClick={() => navigate('progress')}>Track Progress</button>
        </section>
      </div>
    </AppLayout>
  )
}
