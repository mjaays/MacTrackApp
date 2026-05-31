import { useState, useEffect } from 'react'
import { progressApi } from '../services/api'
import { AppLayout } from '../components/AppLayout'
import { LineChart } from '../components/LineChart'
import '../styles/Progress.css'

export function Progress() {
  const [logs, setLogs] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [goal, setGoal] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [weightKg, setWeightKg] = useState('')
  const [bodyFatPct, setBodyFatPct] = useState('')
  const [waistCm, setWaistCm] = useState('')
  const [hipsCm, setHipsCm] = useState('')
  const [chestCm, setChestCm] = useState('')
  const [armsCm, setArmsCm] = useState('')
  const [thighsCm, setThighsCm] = useState('')
  const [notes, setNotes] = useState('')
  const [formMessage, setFormMessage] = useState('')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [logsRes, statsRes, goalRes] = await Promise.all([
        progressApi.getAll(1, 50),
        progressApi.getStats(),
        progressApi.getGoalProgress(),
      ])
      if (logsRes.success) setLogs(logsRes.data?.logs ?? [])
      if (statsRes.success) setStats(statsRes.data)
      if (goalRes.success) setGoal(goalRes.data)
    } catch (err) {
      console.error('Failed to load progress:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormMessage('')
    if (!weightKg) { setFormMessage('Weight is required'); return }

    try {
      const body: Record<string, any> = {
        weightKg: Number(weightKg),
      }
      if (bodyFatPct) body.bodyFatPct = Number(bodyFatPct)
      if (waistCm) body.waistCm = Number(waistCm)
      if (hipsCm) body.hipsCm = Number(hipsCm)
      if (chestCm) body.chestCm = Number(chestCm)
      if (armsCm) body.armsCm = Number(armsCm)
      if (thighsCm) body.thighsCm = Number(thighsCm)
      if (notes) body.notes = notes

      const res = await progressApi.create(body)
      if (res.success) {
        setShowForm(false)
        setWeightKg(''); setBodyFatPct(''); setWaistCm(''); setHipsCm('')
        setChestCm(''); setArmsCm(''); setThighsCm(''); setNotes('')
        loadData()
        ;(window as any).triggerGamificationCheck?.()
      } else {
        setFormMessage(res.error?.message || 'Failed to log progress')
      }
    } catch {
      setFormMessage('Error logging progress')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this progress entry?')) return
    try {
      await progressApi.delete(id)
      loadData()
    } catch { /* ignore */ }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })

  const navigate = (page: string) => (window as any).navigateTo(page)

  const weightTrend = stats?.weightTrend || []

  return (
    <AppLayout title="Progress">
      <div className="progress-container">
        <div className="progress-page-header">
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Log Progress'}
          </button>
        </div>

        {/* Log Progress Form */}
        {showForm && (
          <form className="progress-form" onSubmit={handleCreate}>
            <h3>Log Progress</h3>
            <div className="form-grid">
              <div className="form-field">
                <label>Weight (kg) *</label>
                <input type="number" step="0.1" placeholder="e.g. 75.5" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} required />
              </div>
              <div className="form-field">
                <label>Body Fat %</label>
                <input type="number" step="0.1" placeholder="e.g. 18.5" value={bodyFatPct} onChange={(e) => setBodyFatPct(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Waist (cm)</label>
                <input type="number" step="0.1" placeholder="e.g. 80" value={waistCm} onChange={(e) => setWaistCm(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Hips (cm)</label>
                <input type="number" step="0.1" placeholder="e.g. 95" value={hipsCm} onChange={(e) => setHipsCm(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Chest (cm)</label>
                <input type="number" step="0.1" placeholder="e.g. 100" value={chestCm} onChange={(e) => setChestCm(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Arms (cm)</label>
                <input type="number" step="0.1" placeholder="e.g. 35" value={armsCm} onChange={(e) => setArmsCm(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Thighs (cm)</label>
                <input type="number" step="0.1" placeholder="e.g. 55" value={thighsCm} onChange={(e) => setThighsCm(e.target.value)} />
              </div>
            </div>
            <div className="form-field" style={{ marginTop: 12 }}>
              <label>Notes</label>
              <input type="text" placeholder="Optional notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            {formMessage && <div className="form-error">{formMessage}</div>}
            <button type="submit" className="btn-primary" style={{ marginTop: 16 }}>Save Entry</button>
          </form>
        )}

        {loading ? (
          <div className="loading-state">Loading progress data...</div>
        ) : (
          <>
            {/* Goal Progress */}
            {goal && (
              <section className="goal-card">
                <h3>Goal Progress</h3>
                {!goal.hasGoal ? (
                  <div className="goal-empty">
                    <p>Set a target weight to track your progress toward it.</p>
                    <button className="btn-primary goal-cta" onClick={() => navigate('goals')}>Set a Goal &rarr;</button>
                  </div>
                ) : !goal.hasData ? (
                  <div className="goal-empty">
                    <p>Log your weight to start tracking progress toward {goal.targetWeightKg}kg.</p>
                  </div>
                ) : goal.reached ? (
                  <div className="goal-reached">
                    <span className="goal-reached-emoji">&#x1F3AF;</span>
                    <p className="goal-reached-text">Goal reached! You&rsquo;re at {goal.currentWeightKg?.toFixed(1)}kg.</p>
                  </div>
                ) : (
                  <>
                    <div className="goal-numbers">
                      <div className="goal-pct">
                        <span className="big-number">{goal.percentComplete}%</span>
                        <span className="goal-sub">complete</span>
                      </div>
                      <div className="goal-remaining">
                        <span className="goal-remaining-num">{Math.abs(goal.remainingKg).toFixed(1)}kg</span>
                        <span className="goal-sub">to go</span>
                      </div>
                    </div>

                    <div className="goal-bar-track">
                      <div className="goal-bar-fill" style={{ width: `${goal.percentComplete}%` }} />
                      <div className="goal-bar-marker" style={{ left: `${goal.percentComplete}%` }}>
                        <span className="goal-bar-marker-label">now {goal.currentWeightKg?.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="goal-bar-labels">
                      <span>{goal.startWeightKg?.toFixed(1)}kg start</span>
                      <span>{goal.targetWeightKg?.toFixed(1)}kg goal</span>
                    </div>

                    <div className="goal-meta">
                      {goal.weeklyRateKg != null && (
                        <span className={`goal-rate ${goal.weeklyRateKg < 0 ? 'trend-down' : 'trend-up'}`}>
                          {goal.weeklyRateKg < 0 ? '▼' : '▲'} {Math.abs(goal.weeklyRateKg).toFixed(2)} kg/wk
                        </span>
                      )}
                      {goal.plannedWeeklyRateKg != null && (
                        <span className="goal-planned">
                          target pace {goal.plannedWeeklyRateKg > 0 ? '+' : ''}{goal.plannedWeeklyRateKg} kg/wk
                        </span>
                      )}
                    </div>

                    <p className={`goal-projection ${goal.onTrack ? 'on-track' : 'off-track'}`}>
                      {goal.onTrack && goal.projectedDate
                        ? `On pace to reach ${goal.targetWeightKg}kg around ${formatDate(goal.projectedDate)}`
                        : "Not on pace yet — your recent trend isn't moving toward your goal."}
                    </p>
                  </>
                )}
              </section>
            )}

            {/* Weight Trend Chart */}
            {weightTrend.length > 1 && (
              <section className="chart-card">
                <h3>Weight Trend</h3>
                <LineChart
                  points={weightTrend.map((p: any) => ({ date: p.date, value: p.weightKg }))}
                  targetValue={goal?.targetWeightKg ?? null}
                  unit="kg"
                />
                {stats?.weightChange != null && (
                  <p className="chart-summary">
                    {stats.weightChange > 0 ? '+' : ''}{stats.weightChange.toFixed(1)}kg change over {weightTrend.length} entries
                  </p>
                )}
              </section>
            )}

            {/* Stats Summary */}
            {stats && (
              <section className="stats-grid">
                <div className="stat-box">
                  <h4>Latest Weight</h4>
                  <p className="big-number">{stats.currentWeight?.toFixed(1) || '--'}kg</p>
                </div>
                {stats.latestMeasurements?.bodyFatPct && (
                  <div className="stat-box">
                    <h4>Body Fat</h4>
                    <p className="big-number">{stats.latestMeasurements.bodyFatPct.toFixed(1)}%</p>
                  </div>
                )}
                <div className="stat-box">
                  <h4>Total Entries</h4>
                  <p className="big-number">{logs.length}</p>
                </div>
                {stats.weightChange != null && (
                  <div className="stat-box">
                    <h4>Weight Change</h4>
                    <p className={`big-number ${stats.weightChange < 0 ? 'trend-down' : 'trend-up'}`}>
                      {stats.weightChange > 0 ? '+' : ''}{stats.weightChange.toFixed(1)}kg
                    </p>
                  </div>
                )}
              </section>
            )}

            {/* Progress Entries List */}
            <section className="entries-section">
              <h3>Progress Log</h3>
              {logs.length === 0 ? (
                <p className="empty-state">No progress entries yet. Log your first entry!</p>
              ) : (
                <div className="progress-entries">
                  {logs.map((log: any) => (
                    <div key={log.id} className="progress-entry-card">
                      <div className="entry-header">
                        <span className="entry-date">{formatDate(log.loggedAt || log.createdAt)}</span>
                        <span className="entry-weight">{log.weightKg}kg</span>
                      </div>
                      <div className="entry-measurements">
                        {log.bodyFatPct && <span>BF: {log.bodyFatPct}%</span>}
                        {log.waistCm && <span>Waist: {log.waistCm}cm</span>}
                        {log.hipsCm && <span>Hips: {log.hipsCm}cm</span>}
                        {log.chestCm && <span>Chest: {log.chestCm}cm</span>}
                        {log.armsCm && <span>Arms: {log.armsCm}cm</span>}
                        {log.thighsCm && <span>Thighs: {log.thighsCm}cm</span>}
                      </div>
                      {log.notes && <p className="entry-notes">{log.notes}</p>}
                      <button className="btn-delete-sm" onClick={() => handleDelete(log.id)}>Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AppLayout>
  )
}
