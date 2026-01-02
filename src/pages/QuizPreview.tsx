import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { dataService } from '../services/dataService'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import type { Quiz, Question } from '../types'
import { HiArrowLeft, HiCalendar, HiCheckCircle, HiPlay, HiQuestionMarkCircle } from 'react-icons/hi2'

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
        const e = err as Error
        setError(e.message || 'Failed to load quiz')
      } finally {
        setLoading(false)
      }
    }

    loadQuiz()
  }, [id, user])

  const createdDate = useMemo(() => {
    if (!quiz) return ''
    return new Date(quiz.createdAt).toLocaleDateString()
  }, [quiz])

  const typeLabel = useMemo(() => {
    if (!quiz) return ''
    return quiz.type === 'multiple-choice' ? 'Multiple Choice' : 'True/False'
  }, [quiz])

  if (!user) {
    return (
      <div className="qa-empty qa-fadeIn">
        <div className="qa-card qa-card__pad qa-empty__card">
          <h2 className="qa-empty__title">Sign in required</h2>
          <p className="qa-empty__text">Please sign in to view quiz previews.</p>
          <Link to="/login" className="qa-btn qa-btn--primary qa-btn--full qa-btn--xl">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="qa-empty">
        <LoadingSpinner size="lg" text="Loading quiz preview..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="qa-empty qa-fadeIn">
        <div className="qa-card qa-card__pad qa-empty__card">
          <div className="qa-stack">
            <ErrorMessage message={error} onRetry={() => navigate('/dashboard')} />
            <Link to="/dashboard" className="qa-btn qa-btn--surface qa-btn--full">
              <HiArrowLeft className="qa-ico qa-ico--btn" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="qa-empty qa-fadeIn">
        <div className="qa-card qa-card__pad qa-empty__card">
          <h2 className="qa-empty__title">Quiz not found</h2>
          <p className="qa-empty__text">This quiz may have been removed.</p>
          <Link to="/dashboard" className="qa-btn qa-btn--surface qa-btn--full">
            <HiArrowLeft className="qa-ico qa-ico--btn" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="qa-quizPreview qa-fadeIn">
      <header className="qa-pageHeader qa-pageHeader--split">
        <div className="qa-pageHeader__left">
          <div className="qa-heroIcon" aria-hidden="true">
            <HiQuestionMarkCircle className="qa-ico qa-ico--lg" />
          </div>

          <div className="qa-truncate">
            <h1 className="qa-pageTitle qa-clamp2">{quiz.title}</h1>
            <div className="qa-previewMeta">
              <span className={`qa-chip ${quiz.type === 'multiple-choice' ? 'qa-chip--primary' : 'qa-chip--secondary'}`}>
                {typeLabel}
              </span>
              <span className="qa-previewMeta__item">
                <HiQuestionMarkCircle className="qa-ico qa-ico--btn" />
                {quiz.questions.length} questions
              </span>
              <span className="qa-previewMeta__item">
                <HiCalendar className="qa-ico qa-ico--btn" />
                Created {createdDate}
              </span>
            </div>
          </div>
        </div>

        <div className="qa-pageHeader__actions">
          <Link to={`/quiz/${quiz.id}`} className="qa-btn qa-btn--primary">
            <HiPlay className="qa-ico qa-ico--btn" />
            Take Quiz
          </Link>
          <Link to="/dashboard" className="qa-btn qa-btn--surface">
            <HiArrowLeft className="qa-ico qa-ico--btn" />
            Dashboard
          </Link>
        </div>
      </header>

      <section className="qa-card qa-card__pad">
        <div className="qa-previewList">
          {quiz.questions.map((question: Question, index: number) => (
            <article key={question.id} className="qa-previewQ">
              <div className="qa-previewQ__head">
                <div className="qa-qNum" aria-hidden="true">
                  {index + 1}
                </div>
                <h3 className="qa-previewQ__title">{question.question}</h3>
              </div>

              <div className="qa-previewQ__options" role="list">
                {question.options.map((option: string, optionIndex: number) => {
                  const isCorrect = optionIndex === question.correctAnswer
                  return (
                    <div
                      key={optionIndex}
                      role="listitem"
                      className={`qa-option ${isCorrect ? 'qa-option--correct' : ''}`}
                    >
                      <div className="qa-option__left">
                        <div className="qa-letter" aria-hidden="true">
                          {String.fromCharCode(65 + optionIndex)}
                        </div>
                        <div className="qa-option__text">{option}</div>
                      </div>

                      {isCorrect && (
                        <div className="qa-option__right" aria-label="Correct answer">
                          <HiCheckCircle className="qa-ico qa-ico--btn" />
                          <span>Correct</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {question.explanation && (
                <div className="qa-expl">
                  <div className="qa-expl__title">Explanation</div>
                  <p className="qa-expl__text">{question.explanation}</p>
                </div>
              )}
            </article>
          ))}
        </div>

        <div className="qa-previewFooter">
          <Link to={`/quiz/${quiz.id}`} className="qa-btn qa-btn--primary qa-btn--xl">
            <HiPlay className="qa-ico qa-ico--lg" />
            Take this quiz
          </Link>
        </div>
      </section>
    </div>
  )
}

export default QuizPreview