import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { localStorageService } from '../services/localStorageService'
import {
  HiUser,
  HiLockClosed,
  HiArrowRight,
  HiSparkles,
  HiExclamationTriangle
} from 'react-icons/hi2'

const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn, signUp, continueAsGuest } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const currentUser = JSON.parse(localStorage.getItem('quizai_current_user') || 'null')
      const isCurrentlyGuest = currentUser?.isGuest

      if (isSignUp) {
        await signUp(email, password)
        
        // If user was a guest, migrate their data
        if (isCurrentlyGuest) {
          const newUser = JSON.parse(localStorage.getItem('quizai_current_user') || 'null')
          if (newUser && currentUser) {
            localStorageService.migrateGuestData(currentUser.id, newUser.id)
          }
        }
      } else {
        await signIn(email, password)
        
        // If user was a guest, migrate their data
        if (isCurrentlyGuest) {
          const newUser = JSON.parse(localStorage.getItem('quizai_current_user') || 'null')
          if (newUser && currentUser) {
            localStorageService.migrateGuestData(currentUser.id, newUser.id)
          }
        }
      }
      navigate('/dashboard')
    } catch (err) {
      const error = err as Error
      setError(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGuestMode = () => {
    continueAsGuest()
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full shadow-lg mb-4">
            <HiSparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-primary-900 mb-2">Welcome to QuizAI</h1>
          <p className="text-primary-600">Transform your study materials into interactive quizzes</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-primary-100">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-primary-900">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h2>
            <p className="text-primary-600 mt-1">
              {isSignUp ? 'Join our learning community' : 'Access your quizzes and materials'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <HiExclamationTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-red-800 text-sm leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-primary-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <HiUser className="h-5 w-5 text-primary-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-primary-900 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <HiLockClosed className="h-5 w-5 text-primary-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-12 pr-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white"
                  placeholder="Enter your password"
                />
              </div>
              {isSignUp && (
                <p className="text-xs text-primary-600 mt-1">Password must be at least 6 characters long</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-lg rounded-lg hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <HiArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-primary-100">
            <button
              onClick={handleGuestMode}
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-white text-primary-700 font-semibold rounded-lg border-2 border-primary-200 hover:bg-primary-50 hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <HiSparkles className="w-5 h-5 mr-2" />
              Continue as Guest
            </button>
            <p className="text-xs text-primary-600 text-center mt-3 leading-relaxed">
              Explore QuizAI without an account. Your data will be stored locally and can be migrated to a full account later.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login