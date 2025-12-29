import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  HiSparkles,
  HiDocumentText,
  HiChartBar,
  HiArrowRight,
  HiPlay,
  HiUserPlus,
  HiAcademicCap,
  HiLightBulb,
  HiRocketLaunch
} from 'react-icons/hi2'

const Home: React.FC = () => {
  const { user, continueAsGuest } = useAuth()

  const features = [
    {
      icon: HiDocumentText,
      title: 'Multiple Formats',
      description: 'Upload PDFs, paste text, or add web links to create quizzes from any study material.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: HiSparkles,
      title: 'AI-Powered',
      description: 'Advanced Gemini AI generates intelligent questions tailored to your content.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: HiChartBar,
      title: 'Track Progress',
      description: 'Monitor your learning journey with detailed analytics and performance insights.',
      color: 'from-green-500 to-green-600'
    }
  ]

  const stats = [
    { number: '10K+', label: 'Quizzes Created' },
    { number: '50K+', label: 'Questions Generated' },
    { number: '95%', label: 'User Satisfaction' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-8">
              <HiRocketLaunch className="w-4 h-4 mr-2" />
              Powered by Advanced AI
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Transform Your Study Materials into
              <span className="block text-gradient">Intelligent Quizzes</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Upload PDFs, paste text, or add web links to create personalized quizzes powered by AI.
              Perfect for students, educators, and lifelong learners.
            </p>

            {/* CTA Buttons */}
            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/create-quiz"
                  className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <HiSparkles className="w-5 h-5 mr-2" />
                  Create Your First Quiz
                  <HiArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-8 py-4 text-gray-700 hover:text-gray-900 border-2 border-gray-300 hover:border-gray-400 rounded-xl text-lg font-semibold transition-all hover:bg-gray-50"
                >
                  <HiChartBar className="w-5 h-5 mr-2" />
                  View Dashboard
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={continueAsGuest}
                    className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <HiPlay className="w-5 h-5 mr-2" />
                    Try as Guest
                    <HiArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-all shadow-sm hover:shadow-md"
                  >
                    <HiUserPlus className="w-5 h-5 mr-2" />
                    Sign In / Sign Up
                  </Link>
                </div>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Guest mode stores data locally. Create an account to save your quizzes permanently.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-200 rounded-full opacity-20 animate-pulse"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose QuizAI?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of learning with our AI-powered quiz generation platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-300 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <HiAcademicCap className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already using QuizAI to enhance their study experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/create-quiz"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <HiLightBulb className="w-5 h-5 mr-2" />
              Start Creating Quizzes
              <HiArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home