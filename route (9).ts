'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import LoginPage from '@/components/LoginPage'
import OnboardingPage from '@/components/OnboardingPage'
import StudentDashboard from '@/components/StudentDashboard'
import TeacherDashboard from '@/components/TeacherDashboard'

export default function Home() {
  const { user, loading } = useAuth()
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl animate-bounce mb-4">📚</div>
          <div className="text-2xl font-bold text-white font-display">Loading KidLearn...</div>
          <div className="mt-4 flex gap-2 justify-center">
            <div className="w-4 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-4 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-4 h-4 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage onLogin={() => setNeedsOnboarding(true)} />
  }

  if (needsOnboarding || !user.language) {
    return <OnboardingPage onComplete={() => setNeedsOnboarding(false)} />
  }

  if (user.role === 'teacher') {
    return <TeacherDashboard />
  }

  return <StudentDashboard />
}