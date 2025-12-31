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
    let answered = 0
    
    quiz.questions.forEach((question, index) => {
      if (answers[index] !== -1) { // Only count answered questions
        answered++
        if (answers[index] === question.correctAnswer) {
          correct++
        }
      }
    })
    
    // If no questions were answered, return 0
    if (answered === 0) return 0
    
    return Math.round((correct / answered) * 100)
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
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-surface rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full shadow-lg mb-6">
            <HiSparkles className="w-8 h-8 text-on-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-on-background mb-2">Loading Quiz</h2>
          <p className="text-on-background/60 mb-6">Preparing your questions...</p>
          <div className="w-full bg-surface-200 rounded-full h-2">
            <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-surface rounded-2xl shadow-xl p-8 text-center border border-red-100">
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
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-surface rounded-2xl shadow-xl p-8 text-center border border-amber-100">
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
    const correctCount = quiz.questions.filter((q, i) => answers[i] !== -1 && answers[i] === q.correctAnswer).length
    const answeredCount = quiz.questions.filter((_, i) => answers[i] !== -1).length

    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Results Header */}
          <div className="text-center mb-12">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-primary to-secondary rounded-full shadow-2xl mb-6">
                {score >= 80 ? (
                  <HiTrophy className="w-12 h-12 text-on-primary" />
                ) : score >= 60 ? (
                  <HiCheckCircle className="w-12 h-12 text-on-primary" />
                ) : (
                  <HiSparkles className="w-12 h-12 text-on-primary" />
                )}
              </div>
              <h1 className="text-4xl font-bold text-on-background mb-2">
                Quiz Complete!
              </h1>
              <p className="text-on-background/60 text-lg">Here's how you performed</p>
            </div>

            {/* Score Display */}
            <div className="mb-8">
              <div className={`text-7xl font-bold mb-4 ${getScoreColor(score)}`}>
                {score}%
              </div>
              <div className="text-xl text-on-background/70 mb-3 font-medium">
                {correctCount} out of {answeredCount} answered correctly
                {answeredCount < quiz.questions.length && (
                  <span className="block text-sm text-on-background/50 mt-1">
                    ({quiz.questions.length - answeredCount} questions skipped)
                  </span>
                )}
              </div>
              <div className="text-lg text-on-background/60">
                {score >= 90 ? 'Outstanding performance! 🏆' :
                 score >= 80 ? 'Great job! 🌟' :
                 score >= 70 ? 'Good work! 👏' :
                 score >= 60 ? 'Keep practicing! 📚' :
                 'Try again! 💪'}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto mb-12">
              <div className="w-full bg-surface-200 rounded-full h-4 shadow-inner">
                <div
                  className={`h-4 rounded-full transition-all duration-1000 shadow-sm ${getScoreColor(score).replace('text-', 'bg-')}`}
                  style={{ width: `${score}%` }}
                ></div>
              </div>
              <div className="text-center mt-3 text-sm text-on-background/60 font-medium">
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
                <div key={question.id} className="bg-surface rounded-2xl shadow-xl p-6 border border-gray-100">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shadow-md ${
                      isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-on-background mb-6 leading-relaxed">
                        {question.question}
                      </h3>

                      <div className="space-y-4">
                        {question.options.map((option: string, optionIndex: number) => {
                          let bgColor = 'bg-surface'
                          let borderColor = 'border-gray-200'
                          let textColor = 'text-on-surface'
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
                                  'bg-primary/10 text-primary'
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
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-secondary text-on-primary font-semibold text-lg rounded-xl hover:from-primary/90 hover:to-secondary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-on-background mb-2">
                {quiz.title}
              </h1>
              <div className="flex items-center space-x-4 text-on-background/60">
                <span className="text-lg font-medium">
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </span>
                <div className="hidden sm:block text-sm">
                  ({Math.round(progress)}% complete)
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium">
                <HiSparkles className="w-5 h-5 mr-2" />
                Quiz in Progress
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-surface-200 rounded-full h-4 shadow-inner">
            <div
              className="bg-gradient-to-r from-primary to-secondary h-4 rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-surface rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-semibold text-on-background mb-8 leading-relaxed">
            {question.question}
          </h2>

          {/* Options */}
          <div className="space-y-4">
            {question.options.map((option: string, index: number) => {
              const isSelected = answers[currentQuestion] === index
              const isCorrect = index === question.correctAnswer
              const hasAnswered = answers[currentQuestion] !== -1

              return (
                <label
                  key={index}
                  className={`flex items-start space-x-4 p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                    hasAnswered
                      ? isCorrect
                        ? 'bg-green-50 border-green-300 text-green-900'
                        : isSelected && !isCorrect
                          ? 'bg-red-50 border-red-300 text-red-900'
                          : 'bg-gray-50 border-gray-200 text-gray-500'
                      : 'bg-surface border-gray-200 text-on-surface hover:bg-primary/5 hover:border-primary/30 hover:shadow-md'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleAnswerSelect(index)}
                      disabled={hasAnswered}
                      className={`w-5 h-5 rounded border-2 transition-all ${
                        hasAnswered
                          ? isCorrect
                            ? 'bg-green-500 border-green-500 text-white'
                            : isSelected && !isCorrect
                              ? 'bg-red-500 border-red-500 text-white'
                              : 'bg-gray-300 border-gray-300'
                          : 'border-primary/30 text-primary focus:ring-primary/50 focus:ring-2'
                      }`}
                    />
                  </div>
                  <div className="flex-1 leading-relaxed text-lg">
                    <span className="font-medium mr-3 text-primary">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </div>
                  {hasAnswered && (
                    <div className="flex-shrink-0">
                      {isCorrect ? (
                        <HiCheckCircle className="w-6 h-6 text-green-600" />
                      ) : isSelected && !isCorrect ? (
                        <HiXCircle className="w-6 h-6 text-red-600" />
                      ) : null}
                    </div>
                  )}
                </label>
              )
            })}
          </div>

          {/* Explanation removed - will show only in final results */}
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-surface text-on-surface font-semibold rounded-xl border-2 border-gray-200 hover:bg-surface-200 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-surface disabled:hover:border-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Previous
          </button>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            {currentQuestion === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold text-lg rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <HiCheckCircle className="w-6 h-6 mr-3" />
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary to-secondary text-on-primary font-semibold text-lg rounded-xl hover:from-primary/90 hover:to-secondary/90 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Next
                <HiArrowRight className="w-6 h-6 ml-3" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Progress Indicator */}
        <div className="sm:hidden mt-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium text-sm">
            <HiSparkles className="w-4 h-4 mr-2" />
            Progress: {Math.round(progress)}%
          </div>
        </div>
      </div>
    </div>
  )
}

export default TakeQuiz