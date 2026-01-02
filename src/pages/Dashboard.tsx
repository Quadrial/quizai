// import React, { useState, useEffect } from 'react'
// import { Link } from 'react-router-dom'
// import { useAuth } from '../hooks/useAuth'
// import { dataService } from '../services/dataService'
// import QuizCard from '../components/QuizCard'
// import MaterialCard from '../components/MaterialCard'
// import LoadingSpinner from '../components/LoadingSpinner'
// import {
//   HiChartBar,
//   HiDocumentText,
//   HiQuestionMarkCircle,
//   HiPlus,
//   HiSparkles,
//   HiExclamationTriangle,
//   HiUser
// } from 'react-icons/hi2'
// import type { Quiz, StudyMaterial } from '../types'

// const Dashboard: React.FC = () => {
//   const { user } = useAuth()
//   const [quizzes, setQuizzes] = useState<Quiz[]>([])
//   const [materials, setMaterials] = useState<StudyMaterial[]>([])
//   const [loading, setLoading] = useState(true)
//   const [activeTab, setActiveTab] = useState<'quizzes' | 'materials'>('quizzes')

//   useEffect(() => {
//     const loadData = async () => {
//       if (!user) return

//       try {
//         const [quizzesData, materialsData] = await Promise.all([
//           dataService.getQuizzes(user.id),
//           dataService.getMaterials(user.id)
//         ])
//         setQuizzes(quizzesData)
//         setMaterials(materialsData)
//       } catch (error) {
//         console.error('Error loading data:', error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     loadData()
//   }, [user])

//   const handleDeleteQuiz = async (quizId: string) => {
//     try {
//       await dataService.deleteQuiz(quizId, user?.id)
//       setQuizzes(quizzes.filter(quiz => quiz.id !== quizId))
//     } catch (error) {
//       console.error('Error deleting quiz:', error)
//       alert('Failed to delete quiz. Please try again.')
//     }
//   }

//   const handleDeleteMaterial = async (materialId: string) => {
//     try {
//       await dataService.deleteMaterial(materialId, user?.id)
//       setMaterials(materials.filter(material => material.id !== materialId))
//     } catch (error) {
//       console.error('Error deleting material:', error)
//       alert('Failed to delete material. Please try again.')
//     }
//   }

//   const totalQuestions = quizzes.reduce((total, quiz) => total + quiz.questions.length, 0)

//   if (!user) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100 flex items-center justify-center px-4">
//         <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center border border-yellow-200">
//           <div className="mb-6">
//             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 mb-4">
//               <HiUser className="w-8 h-8 text-white" />
//             </div>
//             <h2 className="text-2xl sm:text-3xl font-bold text-yellow-800 mb-2">Access Required</h2>
//             <p className="text-green-700">Please sign in to view your dashboard</p>
//           </div>
//           <Link
//             to="/login"
//             className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-green-600 text-white rounded-xl font-semibold hover:from-yellow-600 hover:to-green-700 transition-all duration-200 shadow-soft"
//           >
//             Sign In →
//           </Link>
//         </div>
//       </div>
//     )
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-yellow-100 flex items-center justify-center">
//         <LoadingSpinner size="lg" text="Loading your dashboard..." />
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Header */}
//       <div className="bg-surface shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
//             <div>
//               <div className="flex items-center space-x-3 mb-2">
//                 <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
//                   <HiChartBar className="w-6 h-6 text-on-primary" />
//                 </div>
//                 <h1 className="text-2xl sm:text-3xl font-bold text-yellow-800">
//                   Dashboard
//                   {user.isGuest && (
//                     <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
//                       Guest Mode
//                     </span>
//                   )}
//                 </h1>
//               </div>
//               <p className="text-green-700 text-lg">
//                 Manage your quizzes and study materials
//               </p>
//             </div>
//             <Link
//               to="/create-quiz"
//               className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-secondary text-on-primary rounded-xl font-semibold hover:from-primary/90 hover:to-secondary/90 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
//             >
//               <HiPlus className="w-5 h-5 mr-2" />
//               Create New Quiz
//             </Link>
            
//   <Link
//   to="/study-assistant"
//   className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
// >
//   <HiSparkles className="w-5 h-5 mr-2" />
//   AI Study Assistant
// </Link>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Guest Warning */}
//         {user.isGuest && (
//           <div className="mb-8 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6">
//             <div className="flex items-start space-x-3">
//               <HiExclamationTriangle className="w-6 h-6 text-amber-600 mt-0.5" />
//               <div className="flex-1">
//                 <h3 className="text-lg font-semibold text-amber-900 mb-2">Guest Mode Active</h3>
//                 <p className="text-amber-800 mb-4">
//                   Your data is stored locally. Create an account to save your quizzes permanently and access them from any device.
//                 </p>
//                 <Link
//                   to="/login"
//                   className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
//                 >
//                   Create Account
//                 </Link>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <div className="bg-surface rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
//             <div className="flex items-center space-x-4">
//               <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
//                 <HiDocumentText className="w-6 h-6 text-on-primary" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-on-background/60">Total Quizzes</p>
//                 <p className="text-3xl font-bold text-on-background">{quizzes.length}</p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-surface rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
//             <div className="flex items-center space-x-4">
//               <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
//                 <HiSparkles className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-on-background/60">Study Materials</p>
//                 <p className="text-3xl font-bold text-on-background">{materials.length}</p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-surface rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
//             <div className="flex items-center space-x-4">
//               <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
//                 <HiQuestionMarkCircle className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-on-background/60">Total Questions</p>
//                 <p className="text-3xl font-bold text-on-background">{totalQuestions}</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="bg-surface rounded-xl shadow-sm border border-gray-100 mb-8">
//           <div className="border-b border-gray-200">
//             <nav className="flex">
//               <button
//                 onClick={() => setActiveTab('quizzes')}
//                 className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
//                   activeTab === 'quizzes'
//                     ? 'text-primary border-b-2 border-primary bg-primary/10'
//                     : 'text-on-background/60 hover:text-on-background hover:bg-surface-200'
//                 }`}
//               >
//                 <div className="flex items-center justify-center space-x-2">
//                   <HiDocumentText className="w-5 h-5" />
//                   <span>My Quizzes ({quizzes.length})</span>
//                 </div>
//               </button>
//               <button
//                 onClick={() => setActiveTab('materials')}
//                 className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
//                   activeTab === 'materials'
//                     ? 'text-primary border-b-2 border-primary bg-primary/10'
//                     : 'text-on-background/60 hover:text-on-background hover:bg-surface-200'
//                 }`}
//               >
//                 <div className="flex items-center justify-center space-x-2">
//                   <HiSparkles className="w-5 h-5" />
//                   <span>Study Materials ({materials.length})</span>
//                 </div>
//               </button>
//             </nav>
//           </div>

//           {/* Tab Content */}
//           <div className="p-6">
//             {activeTab === 'quizzes' && (
//               <div>
//                 {quizzes.length === 0 ? (
//                   <div className="text-center py-16">
//                     <div className="w-20 h-20 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
//                       <HiDocumentText className="w-10 h-10 text-primary" />
//                     </div>
//                     <h3 className="text-xl font-bold text-on-background mb-2">No quizzes yet</h3>
//                     <p className="text-on-background/60 mb-6 max-w-md mx-auto">
//                       Create your first quiz from study materials to start learning
//                     </p>
//                     <Link
//                       to="/create-quiz"
//                       className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-secondary text-on-primary rounded-xl font-semibold hover:from-primary/90 hover:to-secondary/90 transition-all shadow-lg hover:shadow-xl"
//                     >
//                       <HiPlus className="w-5 h-5 mr-2" />
//                       Create Your First Quiz
//                     </Link>
//                   </div>
//                 ) : (
//                   <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//                     {quizzes.map((quiz) => (
//                       <QuizCard
//                         key={quiz.id}
//                         quiz={quiz}
//                         onDelete={handleDeleteQuiz}
//                       />
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}

//             {activeTab === 'materials' && (
//               <div>
//                 {materials.length === 0 ? (
//                   <div className="text-center py-16">
//                     <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
//                       <HiSparkles className="w-10 h-10 text-green-600" />
//                     </div>
//                     <h3 className="text-xl font-bold text-on-background mb-2">No study materials yet</h3>
//                     <p className="text-on-background/60 mb-6 max-w-md mx-auto">
//                       Upload PDFs, paste text, or add web links to generate quizzes
//                     </p>
//                     <Link
//                       to="/create-quiz"
//                       className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl"
//                     >
//                       <HiPlus className="w-5 h-5 mr-2" />
//                       Add Study Materials
//                     </Link>
//                   </div>
//                 ) : (
//                   <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//                     {materials.map((material) => (
//                       <MaterialCard
//                         key={material.id}
//                         material={material}
//                         onDelete={handleDeleteMaterial}
//                       />
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Dashboard

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