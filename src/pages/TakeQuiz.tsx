import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { dataService } from '../services/dataService'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
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
        const e = err as Error
        setError(e.message || 'Failed to load quiz')
      } finally {
        setLoading(false)
      }
    }

    loadQuiz()
  }, [id, user])

  const answeredCount = useMemo(() => answers.filter((a) => a !== -1).length, [answers])

  const calculateScore = (): number => {
    if (!quiz) return 0

    let correct = 0
    let answered = 0

    quiz.questions.forEach((question, index) => {
      if (answers[index] !== -1) {
        answered++
        if (answers[index] === question.correctAnswer) correct++
      }
    })

    if (answered === 0) return 0
    return Math.round((correct / answered) * 100)
  }

  const correctCount = useMemo(() => {
    if (!quiz) return 0
    return quiz.questions.filter((q, i) => answers[i] !== -1 && answers[i] === q.correctAnswer).length
  }, [quiz, answers])

  const handleAnswerSelect = (answerIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev]
      next[currentQuestion] = answerIndex
      return next
    })
  }

  const handleNext = () => {
    if (!quiz) return
    if (currentQuestion < quiz.questions.length - 1) setCurrentQuestion((q) => q + 1)
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion((q) => q - 1)
  }

  const handleSubmit = async () => {
    if (!quiz || !user) return

    // Optional safety: confirm if nothing was answered
    if (answeredCount === 0) {
      const ok = confirm('You have not answered any questions. Submit anyway?')
      if (!ok) return
    }

    const score = calculateScore()

    try {
      await dataService.saveQuizAttempt(quiz.id, answers, score, user.id)
      setShowResults(true)
    } catch (err) {
      const e = err as Error
      setError(e.message || 'Failed to save quiz attempt')
    }
  }

  const handleRetake = () => {
    if (!quiz) return
    setAnswers(new Array(quiz.questions.length).fill(-1))
    setCurrentQuestion(0)
    setShowResults(false)
    setError('')
  }

  if (!user) {
    return (
      <div className="qa-empty qa-fadeIn">
        <div className="qa-card qa-card__pad qa-empty__card">
          <div className="qa-empty__icon" aria-hidden="true">
            <HiExclamationTriangle className="qa-ico qa-ico--lg" />
          </div>
          <h2 className="qa-empty__title">Sign in required</h2>
          <p className="qa-empty__text">Please sign in to take quizzes.</p>
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
        <LoadingSpinner size="lg" text="Loading quiz..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="qa-empty qa-fadeIn">
        <div className="qa-card qa-card__pad qa-empty__card">
          <ErrorMessage message={error} onRetry={() => navigate('/dashboard')} />
          <button onClick={() => navigate('/dashboard')} className="qa-btn qa-btn--surface qa-btn--full">
            <HiArrowLeft className="qa-ico qa-ico--btn" />
            Back to Dashboard
          </button>
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
          <button onClick={() => navigate('/dashboard')} className="qa-btn qa-btn--surface qa-btn--full">
            <HiArrowLeft className="qa-ico qa-ico--btn" />
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // RESULTS VIEW
  if (showResults) {
    const score = calculateScore()

    const ResultsIcon =
      score >= 80 ? HiTrophy : score >= 60 ? HiCheckCircle : HiSparkles

    const scoreTone =
      score >= 80 ? 'qa-score--good' : score >= 60 ? 'qa-score--mid' : 'qa-score--bad'

    return (
      <div className="qa-quizWrap qa-fadeIn">
        <header className="qa-pageHeader qa-pageHeader--split">
          <div className="qa-pageHeader__left">
            <div className="qa-heroIcon" aria-hidden="true">
              <ResultsIcon className="qa-ico qa-ico--lg" />
            </div>
            <div className="qa-truncate">
              <h1 className="qa-pageTitle">Quiz complete</h1>
              <p className="qa-pageSubtitle">{quiz.title}</p>
            </div>
          </div>

          <div className="qa-pageHeader__actions">
            <button onClick={() => navigate('/dashboard')} className="qa-btn qa-btn--surface">
              <HiChartBar className="qa-ico qa-ico--btn" />
              Dashboard
            </button>
            <button onClick={handleRetake} className="qa-btn qa-btn--primary">
              <HiArrowPath className="qa-ico qa-ico--btn" />
              Retake
            </button>
          </div>
        </header>

        <section className="qa-card qa-card__pad">
          <div className="qa-resultsTop">
            <div className={`qa-score ${scoreTone}`}>
              <div className="qa-score__value">{score}%</div>
              <div className="qa-score__sub">
                {correctCount} correct out of {answeredCount} answered
                {answeredCount < quiz.questions.length ? (
                  <span className="qa-score__muted"> • {quiz.questions.length - answeredCount} skipped</span>
                ) : null}
              </div>
            </div>

            <div className="qa-resultsStats">
              <div className="qa-miniStat">
                <div className="qa-miniStat__label">Questions</div>
                <div className="qa-miniStat__value">{quiz.questions.length}</div>
              </div>
              <div className="qa-miniStat">
                <div className="qa-miniStat__label">Answered</div>
                <div className="qa-miniStat__value">{answeredCount}</div>
              </div>
              <div className="qa-miniStat">
                <div className="qa-miniStat__label">Correct</div>
                <div className="qa-miniStat__value">{correctCount}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="qa-reviewList">
          {quiz.questions.map((question: Question, index: number) => {
            const userAnswer = answers[index]
            const isAnswered = userAnswer !== -1
            const isCorrect = userAnswer === question.correctAnswer

            return (
              <article key={question.id} className="qa-card qa-card__pad qa-reviewQ">
                <div className="qa-reviewQ__head">
                  <div className={`qa-reviewBadge ${isAnswered ? (isCorrect ? 'qa-reviewBadge--good' : 'qa-reviewBadge--bad') : ''}`}>
                    {index + 1}
                  </div>
                  <div className="qa-truncate">
                    <h3 className="qa-reviewQ__title">{question.question}</h3>
                    <div className="qa-reviewQ__sub">
                      {isAnswered ? (
                        isCorrect ? (
                          <span className="qa-reviewState qa-reviewState--good">
                            <HiCheckCircle className="qa-ico qa-ico--btn" /> Correct
                          </span>
                        ) : (
                          <span className="qa-reviewState qa-reviewState--bad">
                            <HiXCircle className="qa-ico qa-ico--btn" /> Incorrect
                          </span>
                        )
                      ) : (
                        <span className="qa-reviewState">Skipped</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="qa-reviewOptions" role="list">
                  {question.options.map((option: string, optionIndex: number) => {
                    const correct = optionIndex === question.correctAnswer
                    const picked = optionIndex === userAnswer

                    let cls = 'qa-reviewOption'
                    if (correct) cls += ' qa-reviewOption--correct'
                    if (picked && !correct) cls += ' qa-reviewOption--wrong'

                    return (
                      <div key={optionIndex} role="listitem" className={cls}>
                        <div className="qa-reviewOption__left">
                          <div className="qa-letter" aria-hidden="true">
                            {String.fromCharCode(65 + optionIndex)}
                          </div>
                          <div className="qa-reviewOption__text">{option}</div>
                        </div>

                        <div className="qa-reviewOption__right">
                          {correct ? <HiCheckCircle className="qa-ico qa-ico--btn" /> : null}
                          {picked && !correct ? <HiXCircle className="qa-ico qa-ico--btn" /> : null}
                        </div>
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
            )
          })}
        </section>
      </div>
    )
  }

  // QUIZ VIEW
  const question = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100
  const selected = answers[currentQuestion]

  return (
    <div className="qa-quizWrap qa-fadeIn">
      <header className="qa-pageHeader qa-pageHeader--split">
        <div className="qa-pageHeader__left">
          <div className="qa-heroIcon" aria-hidden="true">
            <HiSparkles className="qa-ico qa-ico--lg" />
          </div>
          <div className="qa-truncate">
            <h1 className="qa-pageTitle qa-clamp1">{quiz.title}</h1>
            <p className="qa-pageSubtitle">
              Question {currentQuestion + 1} of {quiz.questions.length}
              <span className="qa-dot">•</span>
              {Math.round(progress)}% complete
            </p>
          </div>
        </div>

        <div className="qa-pageHeader__actions">
          <button onClick={() => navigate('/dashboard')} className="qa-btn qa-btn--surface">
            <HiArrowLeft className="qa-ico qa-ico--btn" />
            Exit
          </button>
        </div>
      </header>

      <div className="qa-progress qa-progress--lg" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
        <div className="qa-progress__fill" style={{ width: `${progress}%` }} />
      </div>

      <section className="qa-card qa-card__pad qa-questionCard">
        <h2 className="qa-questionTitle">{question.question}</h2>

        <div className="qa-answerList" role="listbox" aria-label="Answer choices">
          {question.options.map((option: string, idx: number) => {
            const isSel = selected === idx
            return (
              <button
                key={idx}
                type="button"
                className={`qa-answer ${isSel ? 'qa-answer--selected' : ''}`}
                onClick={() => handleAnswerSelect(idx)}
                aria-selected={isSel}
              >
                <div className="qa-answer__letter" aria-hidden="true">
                  {String.fromCharCode(65 + idx)}
                </div>
                <div className="qa-answer__text">{option}</div>
              </button>
            )
          })}
        </div>

        <div className="qa-quizHint">
          Score is based on answered questions. You can skip and come back.
        </div>
      </section>

      <div className="qa-quizNav">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="qa-btn qa-btn--surface"
        >
          <HiArrowLeft className="qa-ico qa-ico--btn" />
          Previous
        </button>

        {currentQuestion === quiz.questions.length - 1 ? (
          <button onClick={handleSubmit} className="qa-btn qa-btn--primary">
            <HiCheckCircle className="qa-ico qa-ico--btn" />
            Submit
          </button>
        ) : (
          <button onClick={handleNext} className="qa-btn qa-btn--primary">
            Next
            <HiArrowRight className="qa-ico qa-ico--btn" />
          </button>
        )}
      </div>
    </div>
  )
}

export default TakeQuiz