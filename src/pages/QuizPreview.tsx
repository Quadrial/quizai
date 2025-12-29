import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { dataService } from '../services/dataService'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import type { Quiz, Question } from '../types'

const QuizPreview: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [quiz, setQuiz] = useState<Quiz | null>(null)
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
      } catch (err) {
        const error = err as Error
        setError(error.message || 'Failed to load quiz')
      } finally {
        setLoading(false)
      }
    }

    loadQuiz()
  }, [id, user])

  if (!user) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Please sign in to view quizzes</h2>
        <Link to="/login" className="text-blue-600 hover:text-blue-700">
          Sign In →
        </Link>
      </div>
    )
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading quiz preview..." />
  }

  if (error) {
    return (
      <div className="text-center">
        <ErrorMessage 
          message={error}
          onRetry={() => navigate('/dashboard')}
        />
        <Link
          to="/dashboard"
          className="text-blue-600 hover:text-blue-700"
        >
          ← Back to Dashboard
        </Link>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Quiz not found</h2>
        <Link
          to="/dashboard"
          className="text-blue-600 hover:text-blue-700"
        >
          ← Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
          <p className="text-gray-600 mt-1">
            {quiz.questions.length} questions • Created {new Date(quiz.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/quiz/${quiz.id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Take Quiz
          </Link>
          <Link
            to="/dashboard"
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-8">
          {quiz.questions.map((question: Question, index: number) => (
            <div key={question.id} className="border-b pb-6 last:border-b-0">
              <h3 className="font-semibold text-lg mb-4">
                {index + 1}. {question.question}
              </h3>
              
              <div className="space-y-3 mb-4">
                {question.options.map((option: string, optionIndex: number) => (
                  <div
                    key={optionIndex}
                    className={`p-3 rounded-lg border ${
                      optionIndex === question.correctAnswer
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <span className="font-medium mr-3">
                          {String.fromCharCode(65 + optionIndex)}.
                        </span>
                        {option}
                      </span>
                      {optionIndex === question.correctAnswer && (
                        <span className="text-green-600 font-medium">✓ Correct</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {question.explanation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
                  <p className="text-blue-800 text-sm">{question.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link
          to={`/quiz/${quiz.id}`}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Take This Quiz
        </Link>
      </div>
    </div>
  )
}

export default QuizPreview