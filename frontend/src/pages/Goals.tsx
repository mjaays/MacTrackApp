import { AppLayout } from '../components/AppLayout'
import '../styles/Goals.css'

export function Goals() {
  return (
    <AppLayout title="Fitness Goals">
      <div className="goals-container">
        <button className="btn-primary btn-new-goal">+ Set New Goal</button>

        <div className="goals-grid">
          <div className="goal-card active">
            <div className="goal-header">
              <h3>Lose 5kg</h3>
              <span className="goal-status in-progress">In Progress</span>
            </div>
            
            <div className="goal-details">
              <p className="goal-description">Reach my target weight by end of quarter</p>
              <div className="goal-timeline">
                <span className="start-date">Started: Jan 15</span>
                <span className="target-date">Target: Apr 15</span>
              </div>
            </div>

            <div className="progress-section">
              <div className="progress-label">
                <span>Progress</span>
                <span className="progress-percentage">60%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '60%' }}></div>
              </div>
              <div className="progress-stats">
                <span>Current: 73.2kg</span>
                <span>Target: 70kg</span>
              </div>
            </div>

            <button className="btn-track">Track Progress</button>
          </div>

          <div className="goal-card active">
            <div className="goal-header">
              <h3>Bench Press 100kg</h3>
              <span className="goal-status in-progress">In Progress</span>
            </div>
            
            <div className="goal-details">
              <p className="goal-description">Increase strength in upper body</p>
              <div className="goal-timeline">
                <span className="start-date">Started: Dec 1</span>
                <span className="target-date">Target: Jun 1</span>
              </div>
            </div>

            <div className="progress-section">
              <div className="progress-label">
                <span>Progress</span>
                <span className="progress-percentage">75%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '75%' }}></div>
              </div>
              <div className="progress-stats">
                <span>Current: 85kg</span>
                <span>Target: 100kg</span>
              </div>
            </div>

            <button className="btn-track">Track Progress</button>
          </div>

          <div className="goal-card completed">
            <div className="goal-header">
              <h3>50 Workouts</h3>
              <span className="goal-status completed-badge">Completed</span>
            </div>
            
            <div className="goal-details">
              <p className="goal-description">Complete 50 workouts in 3 months</p>
              <div className="goal-timeline">
                <span className="start-date">Started: Jan 1</span>
                <span className="target-date">Target: Mar 31</span>
              </div>
            </div>

            <div className="progress-section">
              <div className="progress-label">
                <span>Progress</span>
                <span className="progress-percentage">100%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '100%' }}></div>
              </div>
              <div className="progress-stats">
                <span>Completed: 50</span>
                <span>Target: 50</span>
              </div>
            </div>

            <button className="btn-track disabled">Completed ✓</button>
          </div>

          <div className="goal-card active">
            <div className="goal-header">
              <h3>Run 100km</h3>
              <span className="goal-status in-progress">In Progress</span>
            </div>
            
            <div className="goal-details">
              <p className="goal-description">Build endurance with regular running</p>
              <div className="goal-timeline">
                <span className="start-date">Started: Feb 1</span>
                <span className="target-date">Target: May 31</span>
              </div>
            </div>

            <div className="progress-section">
              <div className="progress-label">
                <span>Progress</span>
                <span className="progress-percentage">42%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '42%' }}></div>
              </div>
              <div className="progress-stats">
                <span>Current: 42km</span>
                <span>Target: 100km</span>
              </div>
            </div>

            <button className="btn-track">Track Progress</button>
          </div>

          <div className="goal-card active">
            <div className="goal-header">
              <h3>7-Day Workout Streak</h3>
              <span className="goal-status in-progress">In Progress</span>
            </div>
            
            <div className="goal-details">
              <p className="goal-description">Work out for 7 consecutive days</p>
              <div className="goal-timeline">
                <span className="start-date">Current Streak: Feb 10</span>
                <span className="target-date">Days: 5/7</span>
              </div>
            </div>

            <div className="progress-section">
              <div className="progress-label">
                <span>Progress</span>
                <span className="progress-percentage">71%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '71%' }}></div>
              </div>
              <div className="progress-stats">
                <span>Days Completed: 5</span>
                <span>Target: 7</span>
              </div>
            </div>

            <button className="btn-track">Track Progress</button>
          </div>

          <div className="goal-card active">
            <div className="goal-header">
              <h3>Core Strength</h3>
              <span className="goal-status in-progress">In Progress</span>
            </div>
            
            <div className="goal-details">
              <p className="goal-description">Build a stronger core with dedicated exercises</p>
              <div className="goal-timeline">
                <span className="start-date">Started: Jan 20</span>
                <span className="target-date">Target: May 20</span>
              </div>
            </div>

            <div className="progress-section">
              <div className="progress-label">
                <span>Progress</span>
                <span className="progress-percentage">45%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '45%' }}></div>
              </div>
              <div className="progress-stats">
                <span>30 workouts done</span>
                <span>Target: 60 workouts</span>
              </div>
            </div>

            <button className="btn-track">Track Progress</button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
