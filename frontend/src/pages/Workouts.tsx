import { AppLayout } from '../components/AppLayout'
import '../styles/Workouts.css'

export function Workouts() {
  const handleStartWorkout = (workoutName: string) => {
    alert(`Starting workout: ${workoutName}`)
  }

  return (
    <AppLayout title="Workouts">
      <div className="workouts-container">
        <div className="workouts-header">
          <button className="btn-primary">+ New Workout</button>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search workouts..."
          />
          <select className="filter-select">
            <option>All Workouts</option>
            <option>Strength</option>
            <option>Cardio</option>
            <option>Flexibility</option>
          </select>
        </div>

        <div className="workouts-grid">
          <div className="workout-card">
            <div className="workout-header">
              <h3>Full Body Strength</h3>
              <span className="category-badge strength">Strength</span>
            </div>
            <div className="workout-details">
              <div className="detail-item">
                <span className="label">Duration:</span>
                <span className="value">60 min</span>
              </div>
              <div className="detail-item">
                <span className="label">Exercises:</span>
                <span className="value">8</span>
              </div>
              <div className="detail-item">
                <span className="label">Difficulty:</span>
                <span className="value">Intermediate</span>
              </div>
            </div>
            <div className="workout-exercises">
              <h4>Exercises:</h4>
              <ul>
                <li>Squats - 4x8</li>
                <li>Bench Press - 4x6</li>
                <li>Deadlifts - 3x5</li>
                <li>Rows - 4x8</li>
              </ul>
            </div>
            <button className="btn-start" onClick={() => handleStartWorkout('Full Body Strength')}>Start Workout</button>
          </div>

          <div className="workout-card">
            <div className="workout-header">
              <h3>HIIT Cardio Blast</h3>
              <span className="category-badge cardio">Cardio</span>
            </div>
            <div className="workout-details">
              <div className="detail-item">
                <span className="label">Duration:</span>
                <span className="value">30 min</span>
              </div>
              <div className="detail-item">
                <span className="label">Exercises:</span>
                <span className="value">5</span>
              </div>
              <div className="detail-item">
                <span className="label">Difficulty:</span>
                <span className="value">Advanced</span>
              </div>
            </div>
            <div className="workout-exercises">
              <h4>Circuit:</h4>
              <ul>
                <li>Burpees - 30s</li>
                <li>Mountain Climbers - 30s</li>
                <li>Jump Squats - 30s</li>
                <li>Push-ups - 30s</li>
              </ul>
            </div>
            <button className="btn-start" onClick={() => handleStartWorkout('HIIT Cardio Blast')}>Start Workout</button>
          </div>

          <div className="workout-card">
            <div className="workout-header">
              <h3>Upper Body Focus</h3>
              <span className="category-badge strength">Strength</span>
            </div>
            <div className="workout-details">
              <div className="detail-item">
                <span className="label">Duration:</span>
                <span className="value">45 min</span>
              </div>
              <div className="detail-item">
                <span className="label">Exercises:</span>
                <span className="value">6</span>
              </div>
              <div className="detail-item">
                <span className="label">Difficulty:</span>
                <span className="value">Intermediate</span>
              </div>
            </div>
            <div className="workout-exercises">
              <h4>Exercises:</h4>
              <ul>
                <li>Pull-ups - 4x6</li>
                <li>Bench Press - 4x8</li>
                <li>Shoulder Press - 3x8</li>
                <li>Lat Pulldowns - 3x10</li>
              </ul>
            </div>
            <button className="btn-start" onClick={() => handleStartWorkout('Upper Body Focus')}>Start Workout</button>
          </div>

          <div className="workout-card">
            <div className="workout-header">
              <h3>Yoga & Stretching</h3>
              <span className="category-badge flexibility">Flexibility</span>
            </div>
            <div className="workout-details">
              <div className="detail-item">
                <span className="label">Duration:</span>
                <span className="value">30 min</span>
              </div>
              <div className="detail-item">
                <span className="label">Exercises:</span>
                <span className="value">12</span>
              </div>
              <div className="detail-item">
                <span className="label">Difficulty:</span>
                <span className="value">Beginner</span>
              </div>
            </div>
            <div className="workout-exercises">
              <h4>Poses:</h4>
              <ul>
                <li>Sun Salutation</li>
                <li>Warrior Pose</li>
                <li>Downward Dog</li>
                <li>Child's Pose</li>
              </ul>
            </div>
            <button className="btn-start" onClick={() => handleStartWorkout('Yoga & Stretching')}>Start Workout</button>
          </div>

          <div className="workout-card">
            <div className="workout-header">
              <h3>Leg Day Destroyer</h3>
              <span className="category-badge strength">Strength</span>
            </div>
            <div className="workout-details">
              <div className="detail-item">
                <span className="label">Duration:</span>
                <span className="value">50 min</span>
              </div>
              <div className="detail-item">
                <span className="label">Exercises:</span>
                <span className="value">7</span>
              </div>
              <div className="detail-item">
                <span className="label">Difficulty:</span>
                <span className="value">Advanced</span>
              </div>
            </div>
            <div className="workout-exercises">
              <h4>Exercises:</h4>
              <ul>
                <li>Squats - 5x5</li>
                <li>Leg Press - 4x8</li>
                <li>Leg Curls - 3x10</li>
                <li>Calves - 4x12</li>
              </ul>
            </div>
            <button className="btn-start" onClick={() => handleStartWorkout('Leg Day Destroyer')}>Start Workout</button>
          </div>

          <div className="workout-card">
            <div className="workout-header">
              <h3>Core & Abs</h3>
              <span className="category-badge strength">Strength</span>
            </div>
            <div className="workout-details">
              <div className="detail-item">
                <span className="label">Duration:</span>
                <span className="value">20 min</span>
              </div>
              <div className="detail-item">
                <span className="label">Exercises:</span>
                <span className="value">5</span>
              </div>
              <div className="detail-item">
                <span className="label">Difficulty:</span>
                <span className="value">Intermediate</span>
              </div>
            </div>
            <div className="workout-exercises">
              <h4>Exercises:</h4>
              <ul>
                <li>Crunches - 3x15</li>
                <li>Planks - 3x60s</li>
                <li>Leg Raises - 3x12</li>
                <li>Russian Twists - 3x15</li>
              </ul>
            </div>
            <button className="btn-start" onClick={() => handleStartWorkout('Core & Abs')}>Start Workout</button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
