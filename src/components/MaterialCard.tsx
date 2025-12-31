import React from 'react'
import { Link } from 'react-router-dom'
import { HiDocumentText, HiLink, HiDocument, HiTrash, HiSparkles, HiEye, HiCalendar } from 'react-icons/hi2'
import type { StudyMaterial } from '../types'

interface MaterialCardProps {
  material: StudyMaterial
  onDelete: (materialId: string) => void
}

const MaterialCard: React.FC<MaterialCardProps> = ({ material, onDelete }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this material?')) {
      onDelete(material.id)
    }
  }

  const getTypeLabel = () => {
    switch (material.type) {
      case 'pdf': return 'PDF Document'
      case 'url': return 'Web Link'
      case 'text': return 'Text Content'
      default: return 'Document'
    }
  }

  const getTypeColor = () => {
    switch (material.type) {
      case 'pdf': return 'from-red-500 to-red-600'
      case 'url': return 'from-blue-500 to-blue-600'
      case 'text': return 'from-green-500 to-green-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const Icon = React.useMemo(() => {
    switch (material.type) {
      case 'pdf': return HiDocument
      case 'url': return HiLink
      case 'text': return HiDocumentText
      default: return HiDocument
    }
  }, [material.type])

  return (
    <div className="group bg-surface rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-1">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${getTypeColor()}`}>
              <Icon className="w-6 h-6 text-on-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-on-background line-clamp-1 group-hover:text-primary transition-colors">
                {material.name}
              </h3>
              <p className="text-sm text-on-background/60">{getTypeLabel()}</p>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 text-on-background/40 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all"
            title="Delete material"
          >
            <HiTrash className="w-5 h-5" />
          </button>
        </div>

        {/* Date */}
        <div className="flex items-center space-x-2 text-sm text-on-background/50 mb-6">
          <HiCalendar className="w-4 h-4" />
          <span>Added {new Date(material.uploadedAt).toLocaleDateString()}</span>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <Link
            to="/create-quiz"
            state={{ selectedMaterial: material }}
            className="flex-1 group/btn inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-primary to-secondary text-on-primary rounded-xl font-semibold hover:from-primary/90 hover:to-secondary/90 transition-all shadow-sm hover:shadow-md transform hover:scale-105"
          >
            <HiSparkles className="w-5 h-5 mr-2" />
            Generate Quiz
          </Link>
          <button
            onClick={() => {
              const preview = material.content.substring(0, 200) + (material.content.length > 200 ? '...' : '')
              alert(`Content Preview:\n\n${preview}`)
            }}
            className="inline-flex items-center justify-center px-4 py-3 bg-surface-200 text-on-background/70 rounded-xl font-medium hover:bg-surface-300 transition-colors"
          >
            <HiEye className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default MaterialCard