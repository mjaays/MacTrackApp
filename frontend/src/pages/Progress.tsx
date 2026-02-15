import { AppLayout } from '../components/AppLayout'
import '../styles/Progress.css'

export function Progress() {
  return (
    <AppLayout title="Progress & Analytics">
      <div className="progress-container">
        {/* Chart Section */}
        <section className="chart-section">
          <div className="chart-card">
            <h3>Calories Burned (Weekly)</h3>
            <div className="chart">
              <div className="chart-bar" style={{ height: '45%' }}><span>Mon</span></div>
              <div className="chart-bar" style={{ height: '65%' }}><span>Tue</span></div>
              <div className="chart-bar" style={{ height: '55%' }}><span>Wed</span></div>
              <div className="chart-bar" style={{ height: '75%' }}><span>Thu</span></div>
              <div className="chart-bar" style={{ height: '70%' }}><span>Fri</span></div>
              <div className="chart-bar" style={{ height: '85%' }}><span>Sat</span></div>
              <div className="chart-bar" style={{ height: '30%' }}><span>Sun</span></div>
            </div>
            <p className="chart-total">Total: 2,850 cal</p>
          </div>

          <div className="chart-card">
            <h3>Weight Progress (Monthly)</h3>
            <div className="line-chart">
              <div className="line-point" style={{ left: '5%', bottom: '20%' }}>75kg</div>
              <div className="line-point" style={{ left: '20%', bottom: '25%' }}>74.8kg</div>
              <div className="line-point" style={{ left: '35%', bottom: '22%' }}>74.5kg</div>
              <div className="line-point" style={{ left: '50%', bottom: '28%' }}>74.2kg</div>
              <div className="line-point" style={{ left: '65%', bottom: '30%' }}>73.9kg</div>
              <div className="line-point" style={{ left: '80%', bottom: '35%' }}>73.5kg</div>
              <div className="line-point" style={{ left: '95%', bottom: '38%' }}>73.2kg</div>
              <svg className="trend-line" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline points="5,80 20,75 35,78 50,72 65,70 80,65 95,62" />
              </svg>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="stats-grid">
          <div className="stat-box">
            <h4>Total Workouts</h4>
            <p className="big-number">127</p>
            <p className="trend">↑ 15 from last month</p>
          </div>

          <div className="stat-box">
            <h4>Total Duration</h4>
            <p className="big-number">156.5h</p>
            <p className="trend">↑ 12 hours from last month</p>
          </div>

          <div className="stat-box">
            <h4>Calories Burned</h4>
            <p className="big-number">38,520</p>
            <p className="trend">↑ 5,200 cal from last month</p>
          </div>

          <div className="stat-box">
            <h4>Personal Records</h4>
            <p className="big-number">8</p>
            <p className="trend">New records this month</p>
          </div>
        </section>

        {/* Exercise Stats */}
        <section className="exercise-stats">
          <h3>Top Exercises</h3>
          <div className="exercise-list">
            <div className="exercise-item">
              <div className="exercise-name">Bench Press</div>
              <div className="exercise-bar">
                <div className="bar-fill" style={{ width: '95%' }}></div>
              </div>
              <div className="exercise-count">42 times</div>
            </div>

            <div className="exercise-item">
              <div className="exercise-name">Squats</div>
              <div className="exercise-bar">
                <div className="bar-fill" style={{ width: '88%' }}></div>
              </div>
              <div className="exercise-count">39 times</div>
            </div>

            <div className="exercise-item">
              <div className="exercise-name">Deadlifts</div>
              <div className="exercise-bar">
                <div className="bar-fill" style={{ width: '75%' }}></div>
              </div>
              <div className="exercise-count">33 times</div>
            </div>

            <div className="exercise-item">
              <div className="exercise-name">Pull-ups</div>
              <div className="exercise-bar">
                <div className="bar-fill" style={{ width: '68%' }}></div>
              </div>
              <div className="exercise-count">30 times</div>
            </div>

            <div className="exercise-item">
              <div className="exercise-name">Running</div>
              <div className="exercise-bar">
                <div className="bar-fill" style={{ width: '82%' }}></div>
              </div>
              <div className="exercise-count">36 times</div>
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section className="achievements">
          <h3>Recent Achievements</h3>
          <div className="achievements-grid">
            <div className="achievement">
              <div className="achievement-icon">🎯</div>
              <p>First Goal Reached</p>
              <span className="date">Feb 10</span>
            </div>
            <div className="achievement">
              <div className="achievement-icon">🏆</div>
              <p>100 Workouts</p>
              <span className="date">Feb 8</span>
            </div>
            <div className="achievement">
              <div className="achievement-icon">💪</div>
              <p>Strength Master</p>
              <span className="date">Feb 5</span>
            </div>
            <div className="achievement">
              <div className="achievement-icon">🔥</div>
              <p>7 Day Streak</p>
              <span className="date">Jan 28</span>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
