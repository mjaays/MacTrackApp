import { useState } from 'react'
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
  const [currentPage, setCurrentPage] = useState<PageType>('home')

  // Set up global window function for navigation
  ;(window as any).navigateTo = (page: PageType) => setCurrentPage(page)

  const renderPage = () => {
    switch (currentPage) {
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
        return <HomePage />
    }
  }

  return renderPage()
}

export default App
