import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import {
  HiUser,
  HiCloudArrowDown,
  HiTrash,
  HiInformationCircle,
  HiExclamationTriangle,
  HiCheckCircle,
  HiXMark
} from 'react-icons/hi2'

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
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-primary-100">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full shadow-lg mb-6">
            <HiUser className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-primary-900 mb-2">Access Required</h2>
          <p className="text-primary-600">Please sign in to access your settings</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full shadow-lg mb-4">
            <HiUser className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-primary-900 mb-2">Settings</h1>
          <p className="text-primary-600">Manage your account and data</p>
        </div>

        <div className="space-y-8">
          {/* Account Information */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-primary-100">
            <div className="flex items-center mb-6">
              <HiUser className="w-6 h-6 text-primary-600 mr-3" />
              <h2 className="text-2xl font-bold text-primary-900">Account Information</h2>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl">
                <div>
                  <label className="block text-sm font-semibold text-primary-900 mb-1">Account Type</label>
                  <p className="text-primary-700">{user.isGuest ? 'Guest Account' : 'Registered User'}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.isGuest
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {user.isGuest ? 'Guest' : 'Registered'}
                </div>
              </div>

              {user.email && (
                <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl">
                  <div>
                    <label className="block text-sm font-semibold text-primary-900 mb-1">Email Address</label>
                    <p className="text-primary-700">{user.email}</p>
                  </div>
                  <HiCheckCircle className="w-5 h-5 text-green-600" />
                </div>
              )}

              <div className="p-4 bg-primary-50 rounded-xl">
                <label className="block text-sm font-semibold text-primary-900 mb-1">User ID</label>
                <p className="text-primary-600 text-sm font-mono break-all">{user.id}</p>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-primary-100">
            <div className="flex items-center mb-6">
              <HiCloudArrowDown className="w-6 h-6 text-primary-600 mr-3" />
              <h2 className="text-2xl font-bold text-primary-900">Data Management</h2>
            </div>
            <div className="space-y-8">
              <div className="p-6 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-100">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                      <HiCloudArrowDown className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-primary-900 mb-2">Export Your Data</h3>
                    <p className="text-primary-600 text-sm mb-4 leading-relaxed">
                      Download all your quizzes, materials, and quiz attempts as a JSON file for backup or migration purposes.
                    </p>
                    <button
                      onClick={handleExportData}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <HiCloudArrowDown className="w-5 h-5 mr-2" />
                      Export Data
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-primary-100 pt-8">
                <div className="p-6 bg-gradient-to-r from-red-50 to-red-50 rounded-xl border border-red-200">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                        <HiTrash className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-900 mb-2">Delete All Data</h3>
                      <p className="text-red-700 text-sm mb-4 leading-relaxed">
                        Permanently delete all your quizzes, materials, and account data. This action cannot be undone and will sign you out.
                      </p>

                      {!showDeleteConfirm ? (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          <HiTrash className="w-5 h-5 mr-2" />
                          Delete All Data
                        </button>
                      ) : (
                        <div className="bg-red-50 border border-red-300 rounded-xl p-6 mt-4">
                          <div className="flex items-start space-x-3 mb-4">
                            <HiExclamationTriangle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-red-800 font-semibold mb-1">Danger Zone</p>
                              <p className="text-red-700 text-sm leading-relaxed">
                                Are you absolutely sure? This will permanently delete all your data including quizzes, materials, and quiz history.
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              onClick={handleDeleteAllData}
                              className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                              <HiTrash className="w-5 h-5 mr-2" />
                              Yes, Delete Everything
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(false)}
                              className="inline-flex items-center justify-center px-6 py-3 bg-white text-red-700 font-semibold rounded-lg border-2 border-red-300 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
                            >
                              <HiXMark className="w-5 h-5 mr-2" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* App Information */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-primary-100">
            <div className="flex items-center mb-6">
              <HiInformationCircle className="w-6 h-6 text-primary-600 mr-3" />
              <h2 className="text-2xl font-bold text-primary-900">About QuizAI</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                  <span className="text-primary-700 font-medium">Version</span>
                  <span className="text-primary-900 font-semibold">1.0.0</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                  <span className="text-primary-700 font-medium">Storage</span>
                  <span className="text-primary-900 font-semibold">Local Browser</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                  <span className="text-primary-700 font-medium">AI Provider</span>
                  <span className="text-primary-900 font-semibold">Google Gemini</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary-50 rounded-lg">
                  <span className="text-primary-700 font-medium">Data Location</span>
                  <span className="text-primary-900 font-semibold">localStorage</span>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-100">
              <p className="text-primary-700 text-sm leading-relaxed">
                QuizAI is a modern learning platform that helps you create interactive quizzes from your study materials using artificial intelligence.
                All your data is stored locally in your browser for privacy and security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings