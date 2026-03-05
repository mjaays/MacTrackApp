import { useState, useEffect } from 'react'
import { workoutApi, exerciseApi } from '../services/api'
import { AppLayout } from '../components/AppLayout'
import '../styles/Workouts.css'

const WORKOUT_TYPES = ['STRENGTH', 'CARDIO', 'HIIT', 'FLEXIBILITY', 'SPORTS', 'MIXED', 'OTHER']
const EXERCISE_CATEGORIES = ['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'BALANCE', 'SPORTS', 'OTHER']

export function Workouts() {
  const [workouts, setWorkouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [showForm, setShowForm] = useState(false)

  // New workout form
  const [wName, setWName] = useState('')
  const [wType, setWType] = useState('STRENGTH')
  const [wStart, setWStart] = useState('')
  const [wEnd, setWEnd] = useState('')
  const [wNotes, setWNotes] = useState('')

  // Exercise search for entries
  const [exerciseSearch, setExerciseSearch] = useState('')
  const [exerciseResults, setExerciseResults] = useState<any[]>([])
  const [searchDone, setSearchDone] = useState(false)
  const [entries, setEntries] = useState<any[]>([])
  const [formMessage, setFormMessage] = useState('')

  // Create exercise form
  const [showCreateExercise, setShowCreateExercise] = useState(false)
  const [newExName, setNewExName] = useState('')
  const [newExCategory, setNewExCategory] = useState('STRENGTH')
  const [newExMuscles, setNewExMuscles] = useState('')
  const [createExMsg, setCreateExMsg] = useState('')

  useEffect(() => { loadWorkouts() }, [])

  const loadWorkouts = async () => {
    setLoading(true)
    try {
      const res = await workoutApi.getAll(undefined, undefined, filter || undefined)
      if (res.success) setWorkouts(res.data || [])
    } catch (err) {
      console.error('Failed to load workouts:', err)
    } finally {
      setLoading(false)
    }
  }

  const searchExercises = async () => {
    if (!exerciseSearch.trim()) return
    setSearchDone(false)
    try {
      const res = await exerciseApi.search(exerciseSearch)
      setExerciseResults(res.success ? (res.data || []) : [])
    } catch { setExerciseResults([]) }
    setSearchDone(true)
  }

  const addEntry = (exercise: any) => {
    if (entries.some(e => e.exerciseId === exercise.id)) return
    setEntries([...entries, {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: 3, reps: 10, weightKg: 0, caloriesBurned: 0,
    }])
    setExerciseResults([])
    setExerciseSearch('')
    setSearchDone(false)
    setShowCreateExercise(false)
  }

  const updateEntry = (idx: number, field: string, value: number) => {
    const updated = [...entries]
    updated[idx] = { ...updated[idx], [field]: value }
    setEntries(updated)
  }

  const removeEntry = (idx: number) => {
    setEntries(entries.filter((_, i) => i !== idx))
  }

  const handleCreateExercise = async () => {
    if (!newExName.trim()) { setCreateExMsg('Name is required'); return }
    setCreateExMsg('')
    try {
      const res = await exerciseApi.create({
        name: newExName.trim(),
        category: newExCategory,
        muscleGroups: newExMuscles || undefined,
      })
      if (res.success && res.data) {
        addEntry(res.data)
        setNewExName('')
        setNewExMuscles('')
        setShowCreateExercise(false)
        setCreateExMsg('')
      } else {
        setCreateExMsg(res.error?.message || 'Failed to create exercise')
      }
    } catch {
      setCreateExMsg('Error creating exercise')
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormMessage('')
    if (entries.length === 0) { setFormMessage('Add at least one exercise'); return }

    try {
      const res = await workoutApi.create({
        name: wName || undefined,
        workoutType: wType,
        startedAt: wStart ? new Date(wStart).toISOString() : new Date().toISOString(),
        endedAt: wEnd ? new Date(wEnd).toISOString() : undefined,
        notes: wNotes || undefined,
        entries: entries.map(e => ({
          exerciseId: e.exerciseId,
          sets: e.sets || undefined,
          reps: e.reps || undefined,
          weightKg: e.weightKg || undefined,
          caloriesBurned: e.caloriesBurned || undefined,
        })),
      })

      if (res.success) {
        setShowForm(false)
        setWName(''); setWType('STRENGTH'); setWStart(''); setWEnd(''); setWNotes('')
        setEntries([])
        loadWorkouts()
      } else {
        setFormMessage(res.error?.message || 'Failed to create workout')
      }
    } catch {
      setFormMessage('Error creating workout')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this workout?')) return
    try {
      await workoutApi.delete(id)
      loadWorkouts()
    } catch { /* ignore */ }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <AppLayout title="Workouts">
      <div className="workouts-container">
        <div className="workouts-header">
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Workout'}
          </button>
          <select className="filter-select" value={filter} onChange={(e) => { setFilter(e.target.value); setTimeout(loadWorkouts, 0) }}>
            <option value="">All Types</option>
            {WORKOUT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase().replace('_', ' ')}</option>)}
          </select>
        </div>

        {/* New Workout Form */}
        {showForm && (
          <form className="workout-form" onSubmit={handleCreate}>
            <h3>Log New Workout</h3>
            <div className="form-grid">
              <div className="form-field">
                <label>Workout Name</label>
                <input type="text" placeholder="e.g. Push Day" value={wName} onChange={(e) => setWName(e.target.value)} />
              </div>
              <div className="form-field">
                <label>Type</label>
                <select value={wType} onChange={(e) => setWType(e.target.value)}>
                  {WORKOUT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase().replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Start Time</label>
                <input type="datetime-local" value={wStart} onChange={(e) => setWStart(e.target.value)} />
              </div>
              <div className="form-field">
                <label>End Time</label>
                <input type="datetime-local" value={wEnd} onChange={(e) => setWEnd(e.target.value)} />
              </div>
            </div>
            <div className="form-field">
              <label>Notes</label>
              <input type="text" placeholder="Optional notes..." value={wNotes} onChange={(e) => setWNotes(e.target.value)} />
            </div>

            {/* Exercise Search */}
            <div className="exercise-search">
              <label>Add Exercises</label>
              <div className="search-bar">
                <input type="text" placeholder="Search exercises..." value={exerciseSearch}
                  onChange={(e) => setExerciseSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchExercises())} />
                <button type="button" onClick={searchExercises}>Search</button>
              </div>
              {exerciseResults.length > 0 && (
                <div className="search-results">
                  {exerciseResults.map((ex: any) => (
                    <div key={ex.id} className="search-result-item" onClick={() => addEntry(ex)}>
                      <span>{ex.name}</span>
                      <span className="category-badge">{ex.category}</span>
                    </div>
                  ))}
                </div>
              )}
              {searchDone && exerciseResults.length === 0 && (
                <p className="search-empty">No exercises found for "{exerciseSearch}".</p>
              )}

              {/* Create Exercise */}
              <button type="button" className="btn-create-exercise" onClick={() => setShowCreateExercise(!showCreateExercise)}>
                {showCreateExercise ? 'Cancel' : '+ Create Custom Exercise'}
              </button>
              {showCreateExercise && (
                <div className="create-exercise-form">
                  <div className="create-exercise-row">
                    <input type="text" placeholder="Exercise name *" value={newExName} onChange={(e) => setNewExName(e.target.value)} />
                    <select value={newExCategory} onChange={(e) => setNewExCategory(e.target.value)}>
                      {EXERCISE_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
                    </select>
                  </div>
                  <input type="text" placeholder="Muscle groups (e.g. Chest, Triceps)" value={newExMuscles} onChange={(e) => setNewExMuscles(e.target.value)} />
                  {createExMsg && <div className="form-error">{createExMsg}</div>}
                  <button type="button" className="btn-primary btn-sm" onClick={handleCreateExercise}>Create & Add</button>
                </div>
              )}
            </div>

            {/* Entries */}
            {entries.length > 0 && (
              <div className="entries-list">
                <h4>Exercises ({entries.length})</h4>
                {entries.map((entry, idx) => (
                  <div key={idx} className="entry-row">
                    <span className="entry-name">{entry.exerciseName}</span>
                    <input type="number" placeholder="Sets" value={entry.sets} onChange={(e) => updateEntry(idx, 'sets', Number(e.target.value))} min="0" />
                    <input type="number" placeholder="Reps" value={entry.reps} onChange={(e) => updateEntry(idx, 'reps', Number(e.target.value))} min="0" />
                    <input type="number" placeholder="kg" value={entry.weightKg} onChange={(e) => updateEntry(idx, 'weightKg', Number(e.target.value))} min="0" />
                    <input type="number" placeholder="cal" value={entry.caloriesBurned} onChange={(e) => updateEntry(idx, 'caloriesBurned', Number(e.target.value))} min="0" />
                    <button type="button" className="btn-remove" onClick={() => removeEntry(idx)}>X</button>
                  </div>
                ))}
              </div>
            )}

            {formMessage && <div className="form-error">{formMessage}</div>}
            <button type="submit" className="btn-primary" style={{ marginTop: 16 }}>Save Workout</button>
          </form>
        )}

        {/* Workouts List */}
        {loading ? (
          <div className="loading-state">Loading workouts...</div>
        ) : workouts.length === 0 ? (
          <div className="empty-state">No workouts yet. Log your first workout!</div>
        ) : (
          <div className="workouts-grid">
            {workouts.map((w: any) => (
              <div key={w.id} className="workout-card">
                <div className="workout-header">
                  <h3>{w.name || w.workoutType}</h3>
                  <span className={`category-badge ${w.workoutType.toLowerCase()}`}>{w.workoutType}</span>
                </div>
                <div className="workout-details">
                  <div className="detail-item"><span className="label">Date:</span><span className="value">{formatDate(w.startedAt)}</span></div>
                  {w.durationMin && <div className="detail-item"><span className="label">Duration:</span><span className="value">{w.durationMin} min</span></div>}
                  <div className="detail-item"><span className="label">Exercises:</span><span className="value">{w.entries?.length || 0}</span></div>
                  <div className="detail-item"><span className="label">Calories:</span><span className="value">{w.totalCaloriesBurned || 0} cal</span></div>
                </div>
                {w.entries && w.entries.length > 0 && (
                  <div className="workout-exercises">
                    <h4>Exercises:</h4>
                    <ul>
                      {w.entries.map((e: any) => (
                        <li key={e.id}>{e.exercise?.name || 'Exercise'} - {e.sets}x{e.reps}{e.weightKg ? ` @ ${e.weightKg}kg` : ''}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <button className="btn-delete" onClick={() => handleDelete(w.id)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
