import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { dataService } from '../services/dataService'
import type { StudyMaterial } from '../types'
import { HiOutlineBookOpen, HiOutlineClock, HiOutlineTrash } from 'react-icons/hi'

const MaterialsHistory: React.FC = () => {
  const { user } = useAuth()
  const [materials, setMaterials] = useState<StudyMaterial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMaterials = async () => {
      if (user) {
        try {
          const userMaterials = await dataService.getMaterials(user.id)
          setMaterials(userMaterials)
        } catch (error) {
          console.error("Failed to fetch materials", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchMaterials()
  }, [user])

  const handleDelete = async (materialId: string) => {
    if (user && window.confirm('Are you sure you want to delete this study material?')) {
        try {
            await dataService.deleteMaterial(materialId, user.id)
            setMaterials(materials.filter(m => m.id !== materialId))
        } catch (error) {
            console.error("Failed to delete material", error)
        }
    }
  }

  if (loading) {
    return <div className="text-center p-8">Loading study materials...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Study Materials History</h1>
      {materials.length === 0 ? (
        <p>You have no saved study materials yet.</p>
      ) : (
        <ul className="space-y-4">
          {materials.map((material) => (
            <li key={material.id} className="p-4 bg-white rounded-lg shadow-md flex items-center justify-between">
              <div className="flex items-center">
                <HiOutlineBookOpen className="h-6 w-6 mr-4 text-gray-500" />
                <div>
                  <Link to={`/study-assistant/${material.id}`} className="text-xl font-semibold text-blue-600 hover:underline">
                    {material.name}
                  </Link>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <HiOutlineClock className="h-4 w-4 mr-1" />
                    <span>{new Date(material.uploadedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDelete(material.id)}
                className="text-red-500 hover:text-red-700"
                title="Delete material"
              >
                <HiOutlineTrash className="h-6 w-6" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MaterialsHistory
