import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { userApi } from '../services/api'
import { AppLayout } from '../components/AppLayout'
import '../styles/Profile.css'

const ACTIVITY_LEVELS = [
  { value: 'SEDENTARY', label: 'Sedentary' },
  { value: 'LIGHTLY_ACTIVE', label: 'Lightly Active' },
  { value: 'MODERATELY_ACTIVE', label: 'Moderately Active' },
  { value: 'VERY_ACTIVE', label: 'Very Active' },
  { value: 'EXTRA_ACTIVE', label: 'Extra Active' },
]

const GENDERS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
]

export function Profile() {
  const { user, refreshUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    heightCm: user?.heightCm || '',
    currentWeightKg: user?.currentWeightKg || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    gender: user?.gender || '',
    activityLevel: user?.activityLevel || '',
  })

  const updateField = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const body: Record<string, any> = {}
      if (form.heightCm) body.heightCm = Number(form.heightCm)
      if (form.currentWeightKg) body.currentWeightKg = Number(form.currentWeightKg)
      if (form.dateOfBirth) body.dateOfBirth = new Date(form.dateOfBirth).toISOString()
      if (form.gender) body.gender = form.gender
      if (form.activityLevel) body.activityLevel = form.activityLevel

      const res = await userApi.updateProfile(body)
      if (res.success) {
        setMessage('Profile updated!')
        await refreshUser()
        setIsEditing(false)
      } else {
        setMessage(res.error?.message || 'Update failed')
      }
    } catch {
      setMessage('Error updating profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout title="Profile Settings">
      <div className="profile-container">
        <section className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-placeholder">{user?.firstName?.[0]?.toUpperCase() || '?'}</div>
          </div>
          <div className="profile-info">
            <h2>{user?.firstName} {user?.lastName}</h2>
            <p>{user?.email}</p>
          </div>
          <button className="btn-edit" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </section>

        {message && <div className={`profile-message ${message.includes('updated') ? 'success' : 'error'}`}>{message}</div>}

        <div className="profile-grid">
          <section className="profile-section">
            <h3>Personal Information</h3>
            <div className="info-group">
              <label>First Name</label>
              <input type="text" value={form.firstName} disabled className="" />
            </div>
            <div className="info-group">
              <label>Last Name</label>
              <input type="text" value={form.lastName} disabled className="" />
            </div>
            <div className="info-group">
              <label>Email</label>
              <input type="email" value={user?.email || ''} disabled className="" />
            </div>
          </section>

          <section className="profile-section">
            <h3>Fitness Information</h3>
            <div className="info-group">
              <label>Date of Birth</label>
              <input
                type="date"
                value={form.dateOfBirth}
                disabled={!isEditing}
                className={isEditing ? 'editable' : ''}
                onChange={(e) => updateField('dateOfBirth', e.target.value)}
              />
            </div>
            <div className="info-group">
              <label>Gender</label>
              <select
                value={form.gender}
                disabled={!isEditing}
                className={isEditing ? 'editable' : ''}
                onChange={(e) => updateField('gender', e.target.value)}
              >
                <option value="">Select...</option>
                {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            <div className="info-group">
              <label>Height (cm)</label>
              <input
                type="number"
                value={form.heightCm}
                disabled={!isEditing}
                className={isEditing ? 'editable' : ''}
                onChange={(e) => updateField('heightCm', e.target.value)}
              />
            </div>
            <div className="info-group">
              <label>Current Weight (kg)</label>
              <input
                type="number"
                value={form.currentWeightKg}
                disabled={!isEditing}
                className={isEditing ? 'editable' : ''}
                onChange={(e) => updateField('currentWeightKg', e.target.value)}
              />
            </div>
            <div className="info-group">
              <label>Activity Level</label>
              <select
                value={form.activityLevel}
                disabled={!isEditing}
                className={isEditing ? 'editable' : ''}
                onChange={(e) => updateField('activityLevel', e.target.value)}
              >
                <option value="">Select...</option>
                {ACTIVITY_LEVELS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
            {isEditing && (
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  )
}
