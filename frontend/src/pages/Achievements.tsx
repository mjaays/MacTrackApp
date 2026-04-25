import { useState, useEffect } from 'react'
import { gamificationApi } from '../services/api'
import { AppLayout } from '../components/AppLayout'
import '../styles/Achievements.css'

type TabType = 'ALL' | 'NUTRITION' | 'FITNESS' | 'CONSISTENCY' | 'MILESTONE'

function xpForLevel(lvl: number) {
  return Math.pow(lvl - 1, 2) * 100
}

function xpPercent(stats: any): number {
  if (!stats) return 0
  const lvl = stats.level ?? 1
  const start = xpForLevel(lvl)
  const end = xpForLevel(lvl + 1)
  if (end === start) return 100
  return Math.min(100, Math.round(((stats.totalXp - start) / (end - start)) * 100))
}

export function Achievements() {
  const [stats, setStats] = useState<any>(null)
  const [achievements, setAchievements] = useState<any[]>([])
  const [quests, setQuests] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('ALL')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const [sRes, aRes, qRes, lRes] = await Promise.all([
        gamificationApi.getStats(),
        gamificationApi.getAchievements(),
        gamificationApi.getTodayQuests(),
        gamificationApi.getLeaderboard(),
      ])
      if (sRes.success) setStats(sRes.data)
      if (aRes.success) setAchievements(aRes.data)
      if (qRes.success) setQuests(qRes.data)
      if (lRes.success) setLeaderboard(lRes.data)
    } catch (err) {
      console.error('Failed to load achievements:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredAchievements = activeTab === 'ALL'
    ? achievements
    : achievements.filter((a) => a.category === activeTab)

  const tabs: TabType[] = ['ALL', 'NUTRITION', 'FITNESS', 'CONSISTENCY', 'MILESTONE']

  const rankEmoji = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  if (loading) {
    return (
      <AppLayout title="Achievements">
        <div className="loading-state">Loading your achievements...</div>
      </AppLayout>
    )
  }

  const lvl = stats?.level ?? 1
  const pct = xpPercent(stats)
  const xpToNext = xpForLevel(lvl + 1) - (stats?.totalXp ?? 0)

  return (
    <AppLayout title="Achievements">
      <div className="achievements-page">

        {/* ── Hero ── */}
        <section className="achievements-hero">
          <div className="level-badge">
            <span className="level-num">{lvl}</span>
            <span className="level-lbl">LVL</span>
          </div>
          <div className="hero-info">
            <h2 className="hero-title">Level {lvl}</h2>
            <p className="hero-xp">{stats?.totalXp ?? 0} XP total · {xpToNext > 0 ? `${xpToNext} XP to next level` : 'Max level reached'}</p>
            <div className="xp-bar">
              <div className="xp-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="streak-badge">
            🔥 {stats?.currentStreak ?? 0} day streak
            {(stats?.longestStreak ?? 0) > 0 && (
              <span className="streak-best"> · best: {stats.longestStreak}</span>
            )}
          </div>
        </section>

        {/* ── Daily Quests ── */}
        <section className="quests-section">
          <h3 className="section-title">Today's Quests</h3>
          <div className="quests-grid">
            {quests.map((q) => {
              const qPct = Math.min(100, Math.round((q.progress / q.target) * 100))
              return (
                <div key={q.questKey} className={`quest-card ${q.completed ? 'completed' : ''}`}>
                  <div className="quest-icon">{q.icon}</div>
                  <div className="quest-body">
                    <p className="quest-title">{q.title}</p>
                    <p className="quest-desc">{q.description}</p>
                    <div className="quest-bar">
                      <div className="quest-fill" style={{ width: `${qPct}%` }} />
                    </div>
                    <div className="quest-footer">
                      <span className="quest-progress">{q.progress}/{q.target}</span>
                      <span className="quest-xp">+{q.xpReward} XP</span>
                      {q.completed && <span className="quest-done">✅</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Achievements ── */}
        <section className="achievements-section">
          <h3 className="section-title">
            Achievements
            <span className="section-sub"> {achievements.filter((a) => a.unlocked).length}/{achievements.length} unlocked</span>
          </h3>
          <div className="tabs">
            {tabs.map((t) => (
              <button
                key={t}
                className={`tab-btn ${activeTab === t ? 'active' : ''}`}
                onClick={() => setActiveTab(t)}
              >
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <div className="achievements-grid">
            {filteredAchievements.map((a) => (
              <div
                key={a.key}
                className={`achievement-card ${a.unlocked ? 'unlocked' : 'locked'} rarity-${a.rarity.toLowerCase()}`}
              >
                <span className={`rarity-badge rarity-${a.rarity.toLowerCase()}`}>{a.rarity}</span>
                <div className="achievement-icon">{a.unlocked ? a.icon : '🔒'}</div>
                <p className="achievement-name">{a.name}</p>
                <p className="achievement-desc">{a.description}</p>
                {a.xpReward > 0 && <p className="achievement-xp">+{a.xpReward} XP</p>}
                {a.unlocked && a.unlockedAt && (
                  <p className="achievement-date">
                    {new Date(a.unlockedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Leaderboard ── */}
        <section className="leaderboard-section">
          <h3 className="section-title">Leaderboard</h3>
          {leaderboard.length === 0 ? (
            <p className="empty-state">No leaderboard data yet.</p>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Level</th>
                  <th>XP</th>
                  <th>Streak</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr key={entry.rank} className={entry.rank <= 3 ? 'top-rank' : ''}>
                    <td className="rank-cell">{rankEmoji(entry.rank)}</td>
                    <td>{entry.displayName}</td>
                    <td>Lvl {entry.level}</td>
                    <td>{entry.totalXp.toLocaleString()}</td>
                    <td>🔥 {entry.currentStreak}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </AppLayout>
  )
}
