import { useState } from 'react'
import '../styles/HomePage.css'

export function HomePage() {
  const [email, setEmail] = useState('')

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Email submitted:', email)
    setEmail('')
    ;(window as any).navigateTo('dashboard')
  }

  const handleGetStarted = () => {
    ;(window as any).navigateTo('dashboard')
  }

  const handleLearnMore = () => {
    // Scroll to features section
    const featuresSection = document.querySelector('.features')
    featuresSection?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">MacTrack</h1>
          <p className="hero-subtitle">
            Track Your Workouts, Achieve Your Goals
          </p>
          <p className="hero-description">
            The ultimate fitness tracking app designed to help you monitor your progress,
            stay motivated, and achieve your fitness goals with ease.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={handleGetStarted}>Get Started</button>
            <button className="btn btn-secondary" onClick={handleLearnMore}>Learn More</button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-header">
          <h2>Powerful Features</h2>
          <p>Everything you need to take your fitness journey to the next level</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Workout Tracking</h3>
            <p>Log your workouts, track sets, reps, and weights. Monitor your progress over time with detailed analytics.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Progress Analytics</h3>
            <p>Visualize your fitness journey with comprehensive charts and statistics. See how far you've come.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Goal Setting</h3>
            <p>Set personal fitness goals and track your progress. Stay motivated with milestone celebrations.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💪</div>
            <h3>Personalized Plans</h3>
            <p>Get workout recommendations tailored to your fitness level and goals.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Achievement System</h3>
            <p>Unlock achievements and badges as you hit milestones in your fitness journey.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Cross-Platform</h3>
            <p>Access your fitness data anytime, anywhere. Seamless sync across all your devices.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Account</h3>
            <p>Sign up in seconds and set up your profile</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Log Your Workouts</h3>
            <p>Record your exercises, sets, and progress</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Track Progress</h3>
            <p>Watch your improvements with real-time analytics</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Achieve Goals</h3>
            <p>Reach your fitness milestones and celebrate wins</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stat-item">
          <h3>10K+</h3>
          <p>Active Users</p>
        </div>
        <div className="stat-item">
          <h3>500K+</h3>
          <p>Workouts Logged</p>
        </div>
        <div className="stat-item">
          <h3>100+</h3>
          <p>Exercise Types</p>
        </div>
        <div className="stat-item">
          <h3>4.8★</h3>
          <p>User Rating</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>Ready to Start Your Fitness Journey?</h2>
        <p>Join thousands of users who are already tracking their workouts with MacTrack</p>
        <form onSubmit={handleSubscribe} className="newsletter-form">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">
            Get Started Free
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-column">
            <h4>MacTrack</h4>
            <p>Your personal fitness companion</p>
          </div>
          <div className="footer-column">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Follow Us</h4>
            <ul>
              <li><a href="#">Twitter</a></li>
              <li><a href="#">Instagram</a></li>
              <li><a href="#">Facebook</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 MacTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
