import { useState, useEffect, useRef, useCallback } from 'react'
import { gamificationApi } from '../services/api'
import '../styles/GamificationToasts.css'

type ToastType = 'levelup' | 'achievement' | 'quest'

interface Toast {
  id: string
  type: ToastType
  icon: string
  title: string
  subtitle: string
  xp?: number
  rarity?: string
}

export function GamificationNotifier() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const prevLevel = useRef<number>(1)
  const prevAchievements = useRef<Set<string>>(new Set())
  const prevQuests = useRef<Set<string>>(new Set())
  const checking = useRef(false)

  const push = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { ...toast, id }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }, [])

  const dismiss = (id: string) => setToasts(prev => prev.filter(t => t.id !== id))

  useEffect(() => {
    // Silently initialise the baseline so first check only shows *new* events
    const init = async () => {
      try {
        const [sRes, aRes, qRes] = await Promise.all([
          gamificationApi.getStats(),
          gamificationApi.getAchievements(),
          gamificationApi.getTodayQuests(),
        ])
        if (sRes.success)  prevLevel.current = sRes.data.level
        if (aRes.success)  prevAchievements.current = new Set(aRes.data.filter((a: any) => a.unlocked).map((a: any) => a.id))
        if (qRes.success)  prevQuests.current = new Set(qRes.data.filter((q: any) => q.completed).map((q: any) => q.questKey))
      } catch { /* silent */ }
    }

    const check = async () => {
      if (checking.current) return
      checking.current = true
      await new Promise(r => setTimeout(r, 500)) // wait for server-side fire-and-forget

      try {
        const [sRes, aRes, qRes] = await Promise.all([
          gamificationApi.getStats(),
          gamificationApi.getAchievements(),
          gamificationApi.getTodayQuests(),
        ])

        const newStats        = sRes.success ? sRes.data   : null
        const newAchievements = aRes.success ? aRes.data   : []
        const newQuests       = qRes.success ? qRes.data   : []

        if (newStats && newStats.level > prevLevel.current) {
          push({ type: 'levelup', icon: '⭐', title: 'Level Up! 🎉', subtitle: `You reached Level ${newStats.level}!` })
          prevLevel.current = newStats.level
        }

        for (const a of newAchievements) {
          if (a.unlocked && !prevAchievements.current.has(a.id)) {
            push({
              type: 'achievement',
              icon: a.icon,
              title: 'Achievement Unlocked!',
              subtitle: a.name,
              xp: a.xpReward > 0 ? a.xpReward : undefined,
              rarity: a.rarity.toLowerCase(),
            })
          }
        }
        prevAchievements.current = new Set(newAchievements.filter((a: any) => a.unlocked).map((a: any) => a.id))

        for (const q of newQuests) {
          if (q.completed && !prevQuests.current.has(q.questKey)) {
            push({ type: 'quest', icon: q.icon, title: 'Quest Complete!', subtitle: q.title, xp: q.xpReward })
          }
        }
        prevQuests.current = new Set(newQuests.filter((q: any) => q.completed).map((q: any) => q.questKey))

      } catch { /* silent */ }
      finally { checking.current = false }
    }

    init()
    ;(window as any).triggerGamificationCheck = check
    return () => { delete (window as any).triggerGamificationCheck }
  }, [push])

  if (toasts.length === 0) return null

  return (
    <div className="g-toasts">
      {toasts.map(t => (
        <div key={t.id} className={`g-toast g-toast-${t.type}${t.rarity ? ` g-rarity-${t.rarity}` : ''}`}>
          <div className="g-toast-icon">{t.icon}</div>
          <div className="g-toast-body">
            <p className="g-toast-title">{t.title}</p>
            <p className="g-toast-sub">{t.subtitle}</p>
            {t.xp && <span className="g-toast-xp">+{t.xp} XP</span>}
          </div>
          <button className="g-toast-close" onClick={() => dismiss(t.id)}>×</button>
        </div>
      ))}
    </div>
  )
}
