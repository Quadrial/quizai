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
  HiArrowPath,
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
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-primary-100">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full shadow-lg mb-6">
            <HiSparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-primary-900 mb-2">Loading Quiz</h2>
          <p className="text-primary-600 mb-6">Preparing your questions...</p>
          <div className="w-full bg-primary-100 rounded-full h-2">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg mb-6">
            <HiExclamationTriangle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-red-900 mb-2">Error</h2>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-amber-100">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full shadow-lg mb-6">
            <HiExclamationTriangle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-amber-900 mb-2">Quiz Not Found</h2>
          <p className="text-amber-700 mb-6">The quiz you're looking for doesn't exist or has been removed</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (showResults) {
    const score = calculateScore()
    const correctCount = quiz.questions.filter((q, i) => answers[i] === q.correctAnswer).length

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Results Header */}
          <div className="text-center mb-12">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-full shadow-2xl mb-6">
                {score >= 80 ? (
                  <HiTrophy className="w-12 h-12 text-white" />
                ) : score >= 60 ? (
                  <HiCheckCircle className="w-12 h-12 text-white" />
                ) : (
                  <HiSparkles className="w-12 h-12 text-white" />
                )}
              </div>
              <h1 className="text-4xl font-bold text-primary-900 mb-2">
                Quiz Complete!
              </h1>
              <p className="text-primary-600 text-lg">Here's how you performed</p>
            </div>

            {/* Score Display */}
            <div className="mb-8">
              <div className={`text-7xl font-bold mb-4 ${getScoreColor(score)}`}>
                {score}%
              </div>
              <div className="text-xl text-primary-700 mb-3 font-medium">
                {correctCount} out of {quiz.questions.length} correct
              </div>
              <div className="text-lg text-primary-600">
                {score >= 90 ? 'Outstanding performance! 🏆' :
                 score >= 80 ? 'Great job! 🌟' :
                 score >= 70 ? 'Good work! 👏' :
                 score >= 60 ? 'Keep practicing! 📚' :
                 'Try again! 💪'}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto mb-12">
              <div className="w-full bg-primary-100 rounded-full h-4 shadow-inner">
                <div
                  className={`h-4 rounded-full transition-all duration-1000 shadow-sm ${getScoreColor(score).replace('text-', 'bg-')}`}
                  style={{ width: `${score}%` }}
                ></div>
              </div>
              <div className="text-center mt-3 text-sm text-primary-600 font-medium">
                Performance Overview
              </div>
            </div>
          </div>

          {/* Questions Review */}
          <div className="space-y-6">
            {quiz.questions.map((question: Question, index: number) => {
              const userAnswer = answers[index]
              const isCorrect = userAnswer === question.correctAnswer

              return (
                <div key={question.id} className="bg-white rounded-2xl shadow-xl p-6 border border-primary-100">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shadow-md ${
                      isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-primary-900 mb-6 leading-relaxed">
                        {question.question}
                      </h3>

                      <div className="space-y-4">
                        {question.options.map((option: string, optionIndex: number) => {
                          let bgColor = 'bg-white'
                          let borderColor = 'border-primary-200'
                          let textColor = 'text-primary-700'
                          let icon = null

                          if (optionIndex === question.correctAnswer) {
                            bgColor = 'bg-green-50'
                            borderColor = 'border-green-300'
                            textColor = 'text-green-900'
                            icon = <HiCheckCircle className="w-5 h-5 text-green-600" />
                          } else if (optionIndex === userAnswer && !isCorrect) {
                            bgColor = 'bg-red-50'
                            borderColor = 'border-red-300'
                            textColor = 'text-red-900'
                            icon = <HiXCircle className="w-5 h-5 text-red-600" />
                          }

                          return (
                            <div
                              key={optionIndex}
                              className={`p-4 rounded-xl border-2 ${bgColor} ${borderColor} ${textColor} transition-all shadow-sm`}
                            >
                              <div className="flex items-center space-x-4">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                  optionIndex === question.correctAnswer ? 'bg-green-500 text-white' :
                                  optionIndex === userAnswer && !isCorrect ? 'bg-red-500 text-white' :
                                  'bg-primary-100 text-primary-600'
                                }`}>
                                  {String.fromCharCode(65 + optionIndex)}
                                </div>
                                <span className="text-base flex-1 leading-relaxed">{option}</span>
                                {icon}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {question.explanation && (
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                          <div className="flex items-start space-x-3">
                            <HiSparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-blue-900 font-semibold mb-1">Explanation</p>
                              <p className="text-blue-800 leading-relaxed">{question.explanation}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="text-center mt-12 space-y-4 sm:space-y-0 sm:space-x-6 sm:flex sm:justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-lg rounded-xl hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <HiChartBar className="w-6 h-6 mr-3" />
              Back to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold text-lg rounded-xl hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <HiArrowPath className="w-6 h-6 mr-3" />
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    )
  }

  const question = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary-900 mb-2">
                {quiz.title}
              </h1>
              <div className="flex items-center space-x-4 text-primary-600">
                <span className="text-lg font-medium">
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </span>
                <div className="hidden sm:block text-sm">
                  ({Math.round(progress)}% complete)
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-medium">
                <HiSparkles className="w-5 h-5 mr-2" />
                Quiz in Progress
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-primary-100 rounded-full h-4 shadow-inner">
            <div
              className="bg-gradient-to-r from-primary-500 to-secondary-600 h-4 rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-primary-100">
          <h2 className="text-2xl font-semibold text-primary-900 mb-8 leading-relaxed">
            {question.question}
          </h2>

          {/* Options */}
          <div className="space-y-4">
            {question.options.map((option: string, index: number) => {
              const isSelected = answers[currentQuestion] === index
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] shadow-sm hover:shadow-md ${
                    isSelected
                      ? 'bg-primary-50 border-primary-400 text-primary-900 shadow-lg ring-2 ring-primary-200'
                      : 'bg-white border-primary-200 text-primary-700 hover:bg-primary-25 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-base font-bold transition-all shadow-sm ${
                      isSelected
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-primary-100 text-primary-600'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-lg leading-relaxed">
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
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl border-2 border-primary-200 hover:bg-primary-50 hover:border-primary-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-primary-200 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Previous
          </button>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            {currentQuestion === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={answers.includes(-1)}
                className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold text-lg rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <HiCheckCircle className="w-6 h-6 mr-3" />
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-lg rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Next
                <HiArrowRight className="w-6 h-6 ml-3" />
              </button>
            )}
          </div>
        </div>

        {/* Warning Message */}
        {answers.includes(-1) && currentQuestion === quiz.questions.length - 1 && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center justify-center">
              <HiExclamationTriangle className="w-5 h-5 text-red-600 mr-3" />
              <p className="text-red-800 font-medium text-center">
                Please answer all questions before submitting
              </p>
            </div>
          </div>
        )}

        {/* Mobile Progress Indicator */}
        <div className="sm:hidden mt-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-medium text-sm">
            <HiSparkles className="w-4 h-4 mr-2" />
            Progress: {Math.round(progress)}%
          </div>
        </div>
      </div>
    </div>
  )
}

export default TakeQuiz