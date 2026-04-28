import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { QRModal } from './QRModal'
import '../styles/AppLayout.css'

interface AppLayoutProps {
  children: React.ReactNode
  title: string
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const { user, logout } = useAuth()
  const [showQR, setShowQR] = useState(false)

  const navigate = (page: string) => {
    ;(window as any).navigateTo(page)
  }

  const handleLogout = async () => {
    await logout()
  }

  const activePage = title.toLowerCase()

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-brand" onClick={() => navigate('dashboard')}>
          MacTrack
        </div>

        <nav className="sidebar-nav">
          <div className={`sidebar-item ${activePage.includes('dashboard') ? 'active' : ''}`} onClick={() => navigate('dashboard')}>
            <span className="sidebar-icon">&#x1F4CA;</span>
            <span>Dashboard</span>
          </div>
          <div className={`sidebar-item ${activePage.includes('workout') ? 'active' : ''}`} onClick={() => navigate('workouts')}>
            <span className="sidebar-icon">&#x1F4AA;</span>
            <span>Workouts</span>
          </div>
          <div className={`sidebar-item ${activePage.includes('progress') ? 'active' : ''}`} onClick={() => navigate('progress')}>
            <span className="sidebar-icon">&#x1F4C8;</span>
            <span>Progress</span>
          </div>
          <div className={`sidebar-item ${activePage.includes('goal') ? 'active' : ''}`} onClick={() => navigate('goals')}>
            <span className="sidebar-icon">&#x1F3AF;</span>
            <span>Goals</span>
          </div>
          <div className={`sidebar-item ${activePage.includes('food') || activePage.includes('meal') ? 'active' : ''}`} onClick={() => navigate('addfood')}>
            <span className="sidebar-icon">&#x1F34E;</span>
            <span>Meals</span>
          </div>
          <div className={`sidebar-item ${activePage.includes('profile') ? 'active' : ''}`} onClick={() => navigate('profile')}>
            <span className="sidebar-icon">&#x1F464;</span>
            <span>Profile</span>
          </div>
          <div className={`sidebar-item ${activePage.includes('achievement') ? 'active' : ''}`} onClick={() => navigate('achievements')}>
            <span className="sidebar-icon">&#x1F3C6;</span>
            <span>Achievements</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          {user && <span className="sidebar-username">{user.firstName}</span>}
          <button className="btn-sidebar-qr" onClick={() => setShowQR(true)} title="Open on mobile">
            &#x1F4F1;
          </button>
          <button className="btn-sidebar-logout" onClick={handleLogout}>Log out</button>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="topbar">
          <h1 className="topbar-title">{title}</h1>
        </header>
        <main className="main-content">
          {children}
        </main>
        <nav className="mobile-nav">
          <div className={`mobile-nav-item ${activePage.includes('dashboard') ? 'active' : ''}`} onClick={() => navigate('dashboard')}>
            <span>&#x1F4CA;</span>
            <span>Dashboard</span>
          </div>
          <div className={`mobile-nav-item ${activePage.includes('workout') ? 'active' : ''}`} onClick={() => navigate('workouts')}>
            <span>&#x1F4AA;</span>
            <span>Workouts</span>
          </div>
          <div className={`mobile-nav-item ${activePage.includes('food') || activePage.includes('meal') ? 'active' : ''}`} onClick={() => navigate('addfood')}>
            <span>&#x1F34E;</span>
            <span>Meals</span>
          </div>
          <div className={`mobile-nav-item ${activePage.includes('progress') ? 'active' : ''}`} onClick={() => navigate('progress')}>
            <span>&#x1F4C8;</span>
            <span>Progress</span>
          </div>
          <div className={`mobile-nav-item ${activePage.includes('profile') ? 'active' : ''}`} onClick={() => navigate('profile')}>
            <span>&#x1F464;</span>
            <span>Profile</span>
          </div>
        </nav>
      </div>

      {showQR && <QRModal onClose={() => setShowQR(false)} />}
    </div>
  )
}
