import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { dataService } from '../services/dataService'
import type { Quiz, Question } from '../types'
import {
  HiArrowLeft,
  HiArrowRight,
  HiCheckCircle,
  HiXCircle,
  HiTrophy,
  HiChartBar,
  HiRefresh,
  HiExclamationTriangle,
  HiSparkles
} from 'react-icons/hi2'

const TakeQuiz: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadQuiz = async () => {
      if (!id || !user) return

      try {
        const quizData = await dataService.getQuiz(id, user.id)
        if (!quizData) {
          setError('Quiz not found')
          return
        }
        setQuiz(quizData)
        setAnswers(new Array(quizData.questions.length).fill(-1))
      } catch (err) {
        const error = err as Error
        setError(error.message || 'Failed to load quiz')
      } finally {
        setLoading(false)
      }
    }

    loadQuiz()
  }, [id, user])

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answerIndex
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    if (!quiz || !user) return

    const score = calculateScore()
    
    try {
      await dataService.saveQuizAttempt(quiz.id, answers, score, user.id)
      setShowResults(true)
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Failed to save quiz attempt')
    }
  }

  const calculateScore = (): number => {
    if (!quiz) return 0
    
    let correct = 0
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++
      }
    })
    
    return Math.round((correct / quiz.questions.length) * 100)
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <span className="text-2xl">🔐</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
            <p className="text-gray-600">Please sign in to take quizzes</p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In →
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4 animate-pulse">
              <span className="text-2xl">📚</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Loading Quiz</h2>
            <p className="text-gray-600">Preparing your questions...</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Quiz Not Found</h2>
            <p className="text-gray-600">The quiz you're looking for doesn't exist</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (showResults) {
    const score = calculateScore()
    const correctCount = quiz.questions.filter((q, i) => answers[i] === q.correctAnswer).length

    return (
      <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Results Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
                <span className="text-2xl sm:text-3xl text-white font-bold">
                  {score >= 80 ? '🎉' : score >= 60 ? '👍' : '💪'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Quiz Complete!
              </h1>
            </div>

            {/* Score Display */}
            <div className="mb-6">
              <div className={`text-5xl sm:text-6xl lg:text-7xl font-bold mb-2 ${getScoreColor(score)}`}>
                {score}%
              </div>
              <div className="text-lg sm:text-xl text-gray-600 mb-2">
                {correctCount} out of {quiz.questions.length} correct
              </div>
              <div className="text-sm sm:text-base text-gray-500">
                {score >= 90 ? 'Outstanding! 🏆' :
                 score >= 80 ? 'Great job! 🌟' :
                 score >= 70 ? 'Good work! 👏' :
                 score >= 60 ? 'Keep practicing! 📚' :
                 'Try again! 💪'}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto mb-8">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all duration-1000 ${getScoreColor(score).replace('text-', 'bg-')}`}
                  style={{ width: `${score}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Questions Review */}
          <div className="space-y-4 sm:space-y-6">
            {quiz.questions.map((question: Question, index: number) => {
              const userAnswer = answers[index]
              const isCorrect = userAnswer === question.correctAnswer

              return (
                <div key={question.id} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
                  <div className="flex items-start space-x-3 sm:space-x-4 mb-4">
                    <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-bold ${
                      isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-4 leading-relaxed">
                        {question.question}
                      </h3>

                      <div className="space-y-3">
                        {question.options.map((option: string, optionIndex: number) => {
                          let bgColor = 'bg-white'
                          let borderColor = 'border-gray-200'
                          let textColor = 'text-gray-700'
                          let icon = null

                          if (optionIndex === question.correctAnswer) {
                            bgColor = 'bg-green-50'
                            borderColor = 'border-green-300'
                            textColor = 'text-green-900'
                            icon = '✅'
                          } else if (optionIndex === userAnswer && !isCorrect) {
                            bgColor = 'bg-red-50'
                            borderColor = 'border-red-300'
                            textColor = 'text-red-900'
                            icon = '❌'
                          }

                          return (
                            <div
                              key={optionIndex}
                              className={`p-3 sm:p-4 rounded-lg border-2 ${bgColor} ${borderColor} ${textColor} transition-all`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                                  optionIndex === question.correctAnswer ? 'bg-green-500 text-white' :
                                  optionIndex === userAnswer && !isCorrect ? 'bg-red-500 text-white' :
                                  'bg-gray-200 text-gray-600'
                                }`}>
                                  {String.fromCharCode(65 + optionIndex)}
                                </div>
                                <span className="text-sm sm:text-base flex-1">{option}</span>
                                {icon && (
                                  <span className="text-lg sm:text-xl">{icon}</span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {question.explanation && (
                        <div className="mt-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-blue-900 text-sm sm:text-base">
                            <strong className="font-semibold">💡 Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="text-center mt-8 sm:mt-12 space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-lg shadow-lg hover:shadow-xl"
            >
              📊 Back to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium text-lg shadow-lg hover:shadow-xl"
            >
              🔄 Retake Quiz
            </button>
          </div>
        </div>
      </div>
    )
  }

  const question = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-0">
              {quiz.title}
            </h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm sm:text-base text-gray-600">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </span>
              <div className="hidden sm:block text-xs text-gray-500">
                ({Math.round(progress)}% complete)
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 sm:h-4 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-6 sm:mb-8 leading-relaxed">
            {question.question}
          </h2>

          {/* Options */}
          <div className="space-y-3 sm:space-y-4">
            {question.options.map((option: string, index: number) => {
              const isSelected = answers[currentQuestion] === index
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-4 sm:p-5 lg:p-6 rounded-xl border-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                    isSelected
                      ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-md ring-2 ring-blue-200'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-bold transition-colors ${
                      isSelected
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-sm sm:text-base lg:text-lg leading-relaxed">
                      {option}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            ← Previous
          </button>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            {currentQuestion === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={answers.includes(-1)}
                className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-lg shadow-lg hover:shadow-xl"
              >
                🎯 Submit Quiz
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-lg shadow-lg hover:shadow-xl"
              >
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Warning Message */}
        {answers.includes(-1) && currentQuestion === quiz.questions.length - 1 && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-center font-medium">
              ⚠️ Please answer all questions before submitting
            </p>
          </div>
        )}

        {/* Mobile Progress Indicator */}
        <div className="sm:hidden mt-6 text-center">
          <div className="text-xs text-gray-500">
            Progress: {Math.round(progress)}%
          </div>
        </div>
      </div>
    </div>
  )
}

export default TakeQuiz