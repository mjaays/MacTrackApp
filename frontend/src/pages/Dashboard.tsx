import { AppLayout } from '../components/AppLayout'
import '../styles/Dashboard.css'

export function Dashboard() {
  return (
    <AppLayout title="Dashboard">
      <div className="dashboard-grid">
        {/* Stats Cards */}
        <section className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">💪</div>
            <div className="stat-content">
              <p className="stat-label">Total Workouts</p>
              <p className="stat-value">42</p>
              <p className="stat-period">This month</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <p className="stat-label">Calories Burned</p>
              <p className="stat-value">12,450</p>
              <p className="stat-period">This week</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <p className="stat-label">Total Time</p>
              <p className="stat-value">45.5h</p>
              <p className="stat-period">This month</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <p className="stat-label">Goals Met</p>
              <p className="stat-value">8/10</p>
              <p className="stat-period">This month</p>
            </div>
          </div>
        </section>

        {/* Recent Workouts */}
        <section className="recent-workouts">
          <h3>Recent Workouts</h3>
          <div className="workout-list">
            <div className="workout-item">
              <div className="workout-info">
                <h4>Chest Day</h4>
                <p>4 exercises • 50 minutes</p>
              </div>
              <div className="workout-stats">
                <span className="badge">245 cal</span>
                <span className="date">Today</span>
              </div>
            </div>

            <div className="workout-item">
              <div className="workout-info">
                <h4>Cardio Session</h4>
                <p>Running • 30 minutes</p>
              </div>
              <div className="workout-stats">
                <span className="badge">320 cal</span>
                <span className="date">Yesterday</span>
              </div>
            </div>

            <div className="workout-item">
              <div className="workout-info">
                <h4>Back & Biceps</h4>
                <p>5 exercises • 60 minutes</p>
              </div>
              <div className="workout-stats">
                <span className="badge">280 cal</span>
                <span className="date">2 days ago</span>
              </div>
            </div>
          </div>
        </section>

        {/* Weekly Activity */}
        <section className="weekly-activity">
          <h3>Weekly Activity</h3>
          <div className="activity-chart">
            <div className="activity-bar" style={{ height: '60%' }}>
              <span className="day">Mon</span>
            </div>
            <div className="activity-bar" style={{ height: '80%' }}>
              <span className="day">Tue</span>
            </div>
            <div className="activity-bar" style={{ height: '70%' }}>
              <span className="day">Wed</span>
            </div>
            <div className="activity-bar" style={{ height: '90%' }}>
              <span className="day">Thu</span>
            </div>
            <div className="activity-bar" style={{ height: '75%' }}>
              <span className="day">Fri</span>
            </div>
            <div className="activity-bar" style={{ height: '85%' }}>
              <span className="day">Sat</span>
            </div>
            <div className="activity-bar" style={{ height: '40%' }}>
              <span className="day">Sun</span>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h3>Quick Actions</h3>
          <button className="action-btn primary">Start Workout</button>
          <button className="action-btn secondary">Log Exercise</button>
          <button className="action-btn secondary">View Progress</button>
        </section>
      </div>
    </AppLayout>
  )
}
