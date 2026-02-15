import { useState } from 'react'
import { AppLayout } from '../components/AppLayout'
import '../styles/Profile.css'

export function Profile() {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <AppLayout title="Profile Settings">
      <div className="profile-container">
        {/* Profile Header */}
        <section className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-placeholder">👤</div>
          </div>
          <div className="profile-info">
            <h2>Nikola Mihajlovic</h2>
            <p>Member since January 2024</p>
          </div>
          <button 
            className="btn-edit"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </section>

        <div className="profile-grid">
          {/* Personal Information */}
          <section className="profile-section">
            <h3>Personal Information</h3>
            <div className="info-group">
              <label>Full Name</label>
              <input 
                type="text" 
                value="Nikola Mihajlovic" 
                disabled={!isEditing}
                className={isEditing ? 'editable' : ''}
              />
            </div>
            <div className="info-group">
              <label>Email</label>
              <input 
                type="email" 
                value="nikola@example.com" 
                disabled={!isEditing}
                className={isEditing ? 'editable' : ''}
              />
            </div>
            <div className="info-group">
              <label>Phone</label>
              <input 
                type="tel" 
                value="+43 123 456 789" 
                disabled={!isEditing}
                className={isEditing ? 'editable' : ''}
              />
            </div>
            {isEditing && <button className="btn-save">Save Changes</button>}
          </section>

          {/* Fitness Information */}
          <section className="profile-section">
            <h3>Fitness Information</h3>
            <div className="info-group">
              <label>Age</label>
              <input 
                type="number" 
                value="19" 
                disabled={!isEditing}
                className={isEditing ? 'editable' : ''}
              />
            </div>
            <div className="info-group">
              <label>Height</label>
              <input 
                type="text" 
                value="195 cm" 
                disabled={!isEditing}
                className={isEditing ? 'editable' : ''}
              />
            </div>
            <div className="info-group">
              <label>Current Weight</label>
              <input 
                type="text" 
                value="75 kg" 
                disabled={!isEditing}
                className={isEditing ? 'editable' : ''}
              />
            </div>
            <div className="info-group">
              <label>Fitness Level</label>
              <select disabled={!isEditing} className={isEditing ? 'editable' : ''}>
                <option>Intermediate</option>
                <option>Beginner</option>
                <option>Advanced</option>
              </select>
            </div>
          </section>

          {/* Preferences */}
          <section className="profile-section">
            <h3>Preferences</h3>
            <div className="preference-item">
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span>Email notifications for milestones</span>
              </label>
            </div>
            <div className="preference-item">
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span>Weekly progress report</span>
              </label>
            </div>
            <div className="preference-item">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Workout reminders</span>
              </label>
            </div>
            <div className="preference-item">
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked />
                <span>Show profile publicly</span>
              </label>
            </div>
          </section>

          {/* Statistics */}
          <section className="profile-section">
            <h3>Your Statistics</h3>
            <div className="stat-display">
              <div className="stat-row">
                <span>Total Workouts:</span>
                <span className="stat-value">127</span>
              </div>
              <div className="stat-row">
                <span>Total Duration:</span>
                <span className="stat-value">156.5 hours</span>
              </div>
              <div className="stat-row">
                <span>Calories Burned:</span>
                <span className="stat-value">38,520 cal</span>
              </div>
              <div className="stat-row">
                <span>Current Streak:</span>
                <span className="stat-value">5 days</span>
              </div>
              <div className="stat-row">
                <span>Active Goals:</span>
                <span className="stat-value">5</span>
              </div>
              <div className="stat-row">
                <span>Completed Goals:</span>
                <span className="stat-value">3</span>
              </div>
            </div>
          </section>

          {/* Account Settings */}
          <section className="profile-section">
            <h3>Account Settings</h3>
            <button className="btn-secondary-full">Change Password</button>
            <button className="btn-secondary-full">Two-Factor Authentication</button>
            <button className="btn-secondary-full">Download My Data</button>
            <button className="btn-danger-full">Delete Account</button>
          </section>
        </div>
      </div>
    </AppLayout>
  )
}
