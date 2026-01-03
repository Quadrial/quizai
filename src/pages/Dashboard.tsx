

import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { dataService } from '../services/dataService'
import QuizCard from '../components/QuizCard'
import MaterialCard from '../components/MaterialCard'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  HiChartBar,
  HiDocumentText,
  HiQuestionMarkCircle,
  HiPlus,
  HiSparkles,
  HiExclamationTriangle,
  HiUser,
  HiAcademicCap
} from 'react-icons/hi2'
import type { Quiz, StudyMaterial } from '../types'

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [materials, setMaterials] = useState<StudyMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'quizzes' | 'materials'>('quizzes')

  useEffect(() => {
    const loadData = async () => {
      if (!user) return
      try {
        const [quizzesData, materialsData] = await Promise.all([
          dataService.getQuizzes(user.id),
          dataService.getMaterials(user.id)
        ])
        setQuizzes(quizzesData)
        setMaterials(materialsData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  const handleDeleteQuiz = async (quizId: string) => {
    if (!user) return
    try {
      await dataService.deleteQuiz(quizId, user.id)
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId))
    } catch (error) {
      console.error('Error deleting quiz:', error)
      alert('Failed to delete quiz. Please try again.')
    }
  }

  const handleDeleteMaterial = async (materialId: string) => {
    if (!user) return
    try {
      await dataService.deleteMaterial(materialId, user.id)
      setMaterials((prev) => prev.filter((m) => m.id !== materialId))
    } catch (error) {
      console.error('Error deleting material:', error)
      alert('Failed to delete material. Please try again.')
    }
  }

  const totalQuestions = useMemo(
    () => quizzes.reduce((total, quiz) => total + quiz.questions.length, 0),
    [quizzes]
  )

  if (!user) {
    return (
      <div className="qa-empty qa-fadeIn">
        <div className="qa-card qa-card__pad qa-empty__card">
          <div className="qa-empty__icon" aria-hidden="true">
            <HiUser className="qa-ico qa-ico--lg" />
          </div>
          <h2 className="qa-empty__title">Access required</h2>
          <p className="qa-empty__text">Please sign in to view your dashboard.</p>
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
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    )
  }

  return (
    <div className="qa-dashboard qa-fadeIn">
      <header className="qa-pageHeader qa-pageHeader--split">
        <div className="qa-pageHeader__left">
          <div className="qa-heroIcon" aria-hidden="true">
            <HiChartBar className="qa-ico qa-ico--lg" />
          </div>

          <div className="qa-truncate">
            <div className="qa-pageTitleRow">
              <h1 className="qa-pageTitle">Dashboard</h1>
              {user.isGuest && <span className="qa-badge qa-badge--warning">Guest Mode</span>}
            </div>
            <p className="qa-pageSubtitle">Manage your quizzes and study materials.</p>
          </div>
        </div>

        <div className="qa-pageHeader__actions">
          <Link to="/study-assistant" className="qa-btn qa-btn--surface">
            <HiSparkles className="qa-ico qa-ico--btn" />
            Study Assistant
          </Link>
          <Link to="/create-quiz" className="qa-btn qa-btn--primary">
            <HiPlus className="qa-ico qa-ico--btn" />
            Create Quiz
          </Link>
        </div>
      </header>

      {user.isGuest && (
        <div className="qa-callout qa-callout--warn qa-guestBanner">
          <HiExclamationTriangle className="qa-ico qa-ico--lg" />
          <div className="qa-callout__body">
            <div className="qa-callout__title">Guest Mode Active</div>
            <div className="qa-callout__text">
              Your data is stored locally in this browser. Create an account to sync across devices.
            </div>
            <div className="qa-callout__actions">
              <Link to="/login" className="qa-btn qa-btn--surface">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}

      <section className="qa-statsGrid" aria-label="Dashboard stats">
        <div className="qa-card qa-card__pad qa-statCard">
          <div className="qa-statIcon qa-statIcon--primary" aria-hidden="true">
            <HiChartBar className="qa-ico qa-ico--lg" />
          </div>
          <div>
            <div className="qa-statLabel">Total quizzes</div>
            <div className="qa-statValue">{quizzes.length}</div>
          </div>
        </div>

        <div className="qa-card qa-card__pad qa-statCard">
          <div className="qa-statIcon qa-statIcon--secondary" aria-hidden="true">
            <HiAcademicCap className="qa-ico qa-ico--lg" />
          </div>
          <div>
            <div className="qa-statLabel">Study materials</div>
            <div className="qa-statValue">{materials.length}</div>
          </div>
        </div>

        <div className="qa-card qa-card__pad qa-statCard">
          <div className="qa-statIcon qa-statIcon--violet" aria-hidden="true">
            <HiQuestionMarkCircle className="qa-ico qa-ico--lg" />
          </div>
          <div>
            <div className="qa-statLabel">Total questions</div>
            <div className="qa-statValue">{totalQuestions}</div>
          </div>
        </div>
      </section>

      <section className="qa-card qa-dashboardPanel">
        <div className="qa-tabs" role="tablist" aria-label="Dashboard tabs">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'quizzes'}
            className={`qa-tab ${activeTab === 'quizzes' ? 'qa-tab--active' : ''}`}
            onClick={() => setActiveTab('quizzes')}
          >
            <HiDocumentText className="qa-ico qa-ico--nav" />
            <span>My quizzes</span>
            <span className="qa-tabCount">{quizzes.length}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'materials'}
            className={`qa-tab ${activeTab === 'materials' ? 'qa-tab--active' : ''}`}
            onClick={() => setActiveTab('materials')}
          >
            <HiAcademicCap className="qa-ico qa-ico--nav" />
            <span>Study materials</span>
            <span className="qa-tabCount">{materials.length}</span>
          </button>
        </div>

        <div className="qa-card__pad">
          {activeTab === 'quizzes' ? (
            quizzes.length === 0 ? (
              <EmptyState
                icon={HiDocumentText}
                title="No quizzes yet"
                description="Create your first quiz from notes, PDFs, or URLs."
                ctaHref="/create-quiz"
                ctaLabel="Create your first quiz"
              />
            ) : (
              <div className="qa-gridCards">
                {quizzes.map((quiz) => (
                  <QuizCard key={quiz.id} quiz={quiz} onDelete={handleDeleteQuiz} />
                ))}
              </div>
            )
          ) : materials.length === 0 ? (
            <EmptyState
              icon={HiAcademicCap}
              title="No study materials yet"
              description="Add study materials to generate quizzes and review faster."
              ctaHref="/create-quiz"
              ctaLabel="Add study material"
            />
          ) : (
            <div className="qa-gridCards">
              {materials.map((material) => (
                <MaterialCard key={material.id} material={material} onDelete={handleDeleteMaterial} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

const EmptyState: React.FC<{
  icon: React.ElementType
  title: string
  description: string
  ctaHref: string
  ctaLabel: string
}> = ({ icon: Icon, title, description, ctaHref, ctaLabel }) => {
  return (
    <div className="qa-emptyState">
      <div className="qa-emptyState__icon" aria-hidden="true">
        <Icon className="qa-ico qa-ico--lg" />
      </div>
      <h3 className="qa-emptyState__title">{title}</h3>
      <p className="qa-emptyState__text">{description}</p>
      <Link to={ctaHref} className="qa-btn qa-btn--primary">
        <HiPlus className="qa-ico qa-ico--btn" />
        {ctaLabel}
      </Link>
    </div>
  )
}

export default Dashboard