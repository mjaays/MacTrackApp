import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import { Login } from './pages/Login'
import { HomePage } from './pages/HomePage'
import { Dashboard } from './pages/Dashboard'
import { Workouts } from './pages/Workouts'
import { Progress } from './pages/Progress'
import { Goals } from './pages/Goals'
import { Profile } from './pages/Profile'
import AddFood from './pages/AddFood'
import './App.css'

type PageType = 'home' | 'dashboard' | 'workouts' | 'progress' | 'goals' | 'profile' | 'addfood'

function App() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard')

  ;(window as any).navigateTo = (page: PageType) => setCurrentPage(page)

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f5f7fa' }}>
        <p style={{ color: '#6b7280', fontSize: 18 }}>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />
      case 'dashboard':
        return <Dashboard />
      case 'workouts':
        return <Workouts />
      case 'progress':
        return <Progress />
      case 'goals':
        return <Goals />
      case 'profile':
        return <Profile />
      case 'addfood':
        return <AddFood />
      default:
        return <Dashboard />
    }
  }

  return renderPage()
}

export default App
