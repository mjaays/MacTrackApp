import { useAuth } from '../context/AuthContext'
import '../styles/AppLayout.css'

interface AppLayoutProps {
  children: React.ReactNode
  title: string
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const { user, logout } = useAuth()

  const navigate = (page: string) => {
    ;(window as any).navigateTo(page)
  }

  const handleLogout = async () => {
    await logout()
  }

  const activePage = title.toLowerCase()

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-brand" onClick={() => navigate('dashboard')}>
          <h1>MacTrack</h1>
        </div>
        <ul className="navbar-menu">
          <li><a className={`nav-link ${activePage.includes('dashboard') ? 'active' : ''}`} onClick={() => navigate('dashboard')}>Dashboard</a></li>
          <li><a className={`nav-link ${activePage.includes('workout') ? 'active' : ''}`} onClick={() => navigate('workouts')}>Workouts</a></li>
          <li><a className={`nav-link ${activePage.includes('progress') ? 'active' : ''}`} onClick={() => navigate('progress')}>Progress</a></li>
          <li><a className={`nav-link ${activePage.includes('goal') ? 'active' : ''}`} onClick={() => navigate('goals')}>Goals</a></li>
          <li><a className={`nav-link ${activePage.includes('food') || activePage.includes('meal') ? 'active' : ''}`} onClick={() => navigate('addfood')}>Meals</a></li>
          <li><a className={`nav-link ${activePage.includes('profile') ? 'active' : ''}`} onClick={() => navigate('profile')}>Profile</a></li>
        </ul>
        <div className="navbar-auth">
          {user && <span className="navbar-user">{user.firstName}</span>}
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="sidebar">
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
      </div>

      <main className="main-content">
        <div className="page-header">
          <h2>{title}</h2>
        </div>
        {children}
      </main>
    </div>
  )
}
