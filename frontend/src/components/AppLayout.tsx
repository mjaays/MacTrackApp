import '../styles/AppLayout.css'

interface AppLayoutProps {
  children: React.ReactNode
  title: string
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const navigate = (page: string) => {
    ;(window as any).navigateTo(page)
  }

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <h1 style={{ cursor: 'pointer' }} onClick={() => navigate('dashboard')}>🏋️ MacTrack</h1>
        </div>
        <ul className="navbar-menu">
          <li><a style={{ cursor: 'pointer' }} onClick={() => navigate('dashboard')} className="nav-link">Dashboard</a></li>
          <li><a style={{ cursor: 'pointer' }} onClick={() => navigate('workouts')} className="nav-link">Workouts</a></li>
          <li><a style={{ cursor: 'pointer' }} onClick={() => navigate('progress')} className="nav-link">Progress</a></li>
          <li><a style={{ cursor: 'pointer' }} onClick={() => navigate('goals')} className="nav-link">Goals</a></li>
          <li><a style={{ cursor: 'pointer' }} onClick={() => navigate('addfood')} className="nav-link">Add Food</a></li>
          <li><a style={{ cursor: 'pointer' }} onClick={() => navigate('profile')} className="nav-link">Profile</a></li>
        </ul>
        <div className="navbar-auth">
          <button className="btn-logout" onClick={() => navigate('home')}>Logout</button>
        </div>
      </nav>

      <div className="sidebar">
        <div className="sidebar-item" onClick={() => navigate('dashboard')} style={{ cursor: 'pointer' }}>
          <span className="sidebar-icon">📊</span>
          <span>Dashboard</span>
        </div>
        <div className="sidebar-item" onClick={() => navigate('workouts')} style={{ cursor: 'pointer' }}>
          <span className="sidebar-icon">💪</span>
          <span>Workouts</span>
        </div>
        <div className="sidebar-item" onClick={() => navigate('progress')} style={{ cursor: 'pointer' }}>
          <span className="sidebar-icon">📈</span>
          <span>Progress</span>
        </div>
        <div className="sidebar-item" onClick={() => navigate('goals')} style={{ cursor: 'pointer' }}>
          <span className="sidebar-icon">🎯</span>
          <span>Goals</span>
        </div>
        <div className="sidebar-item" onClick={() => navigate('addfood')} style={{ cursor: 'pointer' }}>
          <span className="sidebar-icon">🍎</span>
          <span>Add Food</span>
        </div>
        <div className="sidebar-item" onClick={() => navigate('profile')} style={{ cursor: 'pointer' }}>
          <span className="sidebar-icon">👤</span>
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
