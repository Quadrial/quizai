import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

const Settings: React.FC = () => {
  const { user, signOut } = useAuth()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleExportData = () => {
    if (!user) return

    const data = {
      quizzes: JSON.parse(localStorage.getItem('quizai_quizzes') || '[]'),
      materials: JSON.parse(localStorage.getItem('quizai_materials') || '[]'),
      attempts: JSON.parse(localStorage.getItem('quizai_attempts') || '[]'),
      exportDate: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quizai-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDeleteAllData = () => {
    if (!user) return

    localStorage.removeItem('quizai_quizzes')
    localStorage.removeItem('quizai_materials')
    localStorage.removeItem('quizai_attempts')
    
    if (!user.isGuest) {
      localStorage.removeItem('quizai_users')
    }
    
    setShowDeleteConfirm(false)
    signOut()
    window.location.href = '/'
  }

  if (!user) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Please sign in to access settings</h2>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Account Information */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Type</label>
              <p className="text-gray-900">{user.isGuest ? 'Guest Account' : 'Registered User'}</p>
            </div>
            {user.email && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{user.email}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">User ID</label>
              <p className="text-gray-500 text-sm font-mono">{user.id}</p>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Data Management</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Export Your Data</h3>
              <p className="text-gray-600 text-sm mb-3">
                Download all your quizzes, materials, and quiz attempts as a JSON file.
              </p>
              <button
                onClick={handleExportData}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Export Data
              </button>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium text-red-900 mb-2">Delete All Data</h3>
              <p className="text-red-600 text-sm mb-3">
                Permanently delete all your quizzes, materials, and account data. This action cannot be undone.
              </p>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete All Data
                </button>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-800 font-medium mb-3">
                    Are you absolutely sure? This will permanently delete everything.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleDeleteAllData}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                    >
                      Yes, Delete Everything
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* App Information */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">About QuizAI</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Version:</strong> 1.0.0</p>
            <p><strong>Storage:</strong> Local Browser Storage</p>
            <p><strong>AI Provider:</strong> Google Gemini AI</p>
            <p><strong>Data Location:</strong> Your browser's localStorage</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings