// import React from 'react'
// import { Link } from 'react-router-dom'
// import { HiPlay, HiEye, HiTrash, HiQuestionMarkCircle, HiCalendar } from 'react-icons/hi2'
// import type { Quiz } from '../types'

// interface QuizCardProps {
//   quiz: Quiz
//   onDelete: (quizId: string) => void
// }

// const QuizCard: React.FC<QuizCardProps> = ({ quiz, onDelete }) => {
//   const handleDelete = (e: React.MouseEvent) => {
//     e.preventDefault()
//     e.stopPropagation()
//     if (confirm('Are you sure you want to delete this quiz?')) {
//       onDelete(quiz.id)
//     }
//   }

//   return (
//     <div className="group bg-surface rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-1">
//       <div className="p-6">
//         {/* Header */}
//         <div className="flex items-start justify-between mb-4">
//           <h3 className="font-bold text-lg text-on-background line-clamp-2 group-hover:text-primary transition-colors">
//             {quiz.title}
//           </h3>
//           <button
//             onClick={handleDelete}
//             className="opacity-0 group-hover:opacity-100 text-on-background/40 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all"
//             title="Delete quiz"
//           >
//             <HiTrash className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Stats */}
//         <div className="flex items-center justify-between text-sm text-on-background/60 mb-6">
//           <div className="flex items-center space-x-1">
//             <HiQuestionMarkCircle className="w-4 h-4" />
//             <span>{quiz.questions.length} questions</span>
//           </div>
//           <div className="flex items-center space-x-1">
//             <HiCalendar className="w-4 h-4" />
//             <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
//           </div>
//         </div>

//         {/* Quiz Type Badge */}
//         <div className="mb-6">
//           <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
//             quiz.type === 'multiple-choice'
//               ? 'bg-primary/10 text-primary'
//               : 'bg-secondary/10 text-secondary'
//           }`}>
//             {quiz.type === 'multiple-choice' ? 'Multiple Choice' : 'True/False'}
//           </span>
//         </div>

//         {/* Actions */}
//         <div className="flex space-x-3">
//           <Link
//             to={`/quiz/${quiz.id}`}
//             className="flex-1 group/btn inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-primary to-secondary text-on-primary rounded-xl font-semibold hover:from-primary/90 hover:to-secondary/90 transition-all shadow-sm hover:shadow-md transform hover:scale-105"
//           >
//             <HiPlay className="w-5 h-5 mr-2" />
//             Take Quiz
//           </Link>
//           <Link
//             to={`/quiz/${quiz.id}/preview`}
//             className="inline-flex items-center justify-center px-4 py-3 bg-surface-200 text-on-background/70 rounded-xl font-medium hover:bg-surface-300 transition-colors"
//           >
//             <HiEye className="w-5 h-5" />
//           </Link>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default QuizCard

import React from 'react'
import { Link } from 'react-router-dom'
import { HiPlay, HiEye, HiTrash, HiQuestionMarkCircle, HiCalendar } from 'react-icons/hi2'
import type { Quiz } from '../types'

interface QuizCardProps {
  quiz: Quiz
  onDelete: (quizId: string) => void
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz, onDelete }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this quiz?')) {
      onDelete(quiz.id)
    }
  }

  return (
    <article className="qa-card qa-card--lift">
      <div className="qa-card__pad">
        <div className="qa-card__header">
          <h3 className="qa-card__title qa-clamp2">{quiz.title}</h3>

          <button
            onClick={handleDelete}
            className="qa-btn qa-btn--dangerGhost qa-iconBtn qa-dangerBtn"
            title="Delete quiz"
            aria-label="Delete quiz"
          >
            <HiTrash className="qa-ico qa-ico--lg" />
          </button>
        </div>

        <div className="qa-card__meta">
          <div className="qa-metaItem">
            <HiQuestionMarkCircle className="qa-ico qa-ico--btn" />
            <span>{quiz.questions.length} questions</span>
          </div>
          <div className="qa-metaItem">
            <HiCalendar className="qa-ico qa-ico--btn" />
            <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <span className={`qa-chip ${quiz.type === 'multiple-choice' ? 'qa-chip--primary' : 'qa-chip--secondary'}`}>
            {quiz.type === 'multiple-choice' ? 'Multiple Choice' : 'True/False'}
          </span>
        </div>

        <div className="qa-card__actions">
          <Link to={`/quiz/${quiz.id}`} className="qa-btn qa-btn--primary qa-btn--grow">
            <HiPlay className="qa-ico qa-ico--btn" />
            <span>Take Quiz</span>
          </Link>

          <Link
            to={`/quiz/${quiz.id}/preview`}
            className="qa-btn qa-btn--surface qa-iconBtn"
            aria-label="Preview quiz"
            title="Preview quiz"
          >
            <HiEye className="qa-ico qa-ico--lg" />
          </Link>
        </div>
      </div>
    </article>
  )
}

export default QuizCard