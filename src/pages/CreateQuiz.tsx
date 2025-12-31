import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { quizService } from '../services/quizService'
import { dataService } from '../services/dataService'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import type { StudyMaterial } from '../types'
import * as pdfjsLib from 'pdfjs-dist'
import {
  HiDocumentText,
  HiLink,
  HiCloudArrowUp,
  HiCheckCircle,
  HiSparkles,
  HiExclamationTriangle
} from 'react-icons/hi2'

const CreateQuiz: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [step, setStep] = useState<'material' | 'generating'>('material')
  const [materialType, setMaterialType] = useState<'text' | 'pdf' | 'url'>('text')
  const [materialName, setMaterialName] = useState('')
  const [textContent, setTextContent] = useState('')
  const [urlContent, setUrlContent] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [questionCount, setQuestionCount] = useState(10)
  const [questionType, setQuestionType] = useState<'multiple-choice' | 'true-false'>('multiple-choice')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'technical'>('medium')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pdfProcessing, setPdfProcessing] = useState(false)
  const [pdfProgress, setPdfProgress] = useState(0)

  // Check if we have a pre-selected material from dashboard
  useEffect(() => {
    const selectedMaterial = location.state?.selectedMaterial as StudyMaterial
    if (selectedMaterial) {
      setMaterialType(selectedMaterial.type)
      setMaterialName(selectedMaterial.name)
      if (selectedMaterial.type === 'text') {
        setTextContent(selectedMaterial.content)
      } else if (selectedMaterial.type === 'url') {
        setUrlContent(selectedMaterial.content)
      }
    }
  }, [location.state])

  const handleGenerateQuiz = async () => {
    if (!user) return

    setLoading(true)
    setError('')
    setStep('generating')

    try {
      let content = ''
      let name = materialName || 'Untitled Material'

      // Prepare content based on type
      if (materialType === 'text') {
        content = textContent
      } else if (materialType === 'url') {
        content = await quizService.extractTextFromURL(urlContent)
        name = name || urlContent
      } else if (materialType === 'pdf' && pdfFile) {
        setPdfProcessing(true)
        setPdfProgress(10)
        content = await quizService.extractTextFromPDF(pdfFile)
        setPdfProgress(100)
        setPdfProcessing(false)
        name = name || pdfFile.name
      }

      if (!content.trim()) {
        throw new Error('Please provide some content to generate a quiz from')
      }

      // Create study material
      const material: StudyMaterial = {
        id: crypto.randomUUID(),
        type: materialType,
        content,
        name,
        uploadedAt: new Date().toISOString()
      }

      // Save the material
      await dataService.saveMaterial(material, user.id)

      // Generate quiz
      const quiz = await quizService.generateQuiz(material, questionCount, questionType, difficulty)
      
      // Save the quiz and navigate directly to take it
      await dataService.saveQuiz(quiz, user.id)
      navigate(`/quiz/${quiz.id}`)
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Failed to generate quiz')
      setStep('material')
    } finally {
      setLoading(false)
    }
  }



  const handlePdfFileSelect = async (file: File | null) => {
    if (!file) {
      setPdfFile(null)
      setPdfProgress(0)
      return
    }

    // Validate file type
    if (!file.type.includes('pdf')) {
      setError('Please select a valid PDF file')
      return
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      setError('PDF file size must be less than 50MB')
      return
    }

    setPdfFile(file)
    setPdfProcessing(true)
    setPdfProgress(10)
    setError('')

    try {
      // Simulate processing progress
      setPdfProgress(30)
      
      // Basic validation - check if file can be read
      const arrayBuffer = await file.arrayBuffer()
      setPdfProgress(60)
      
      // Try to load with PDF.js to validate
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      setPdfProgress(90)
      
      // Get basic info
      const numPages = pdf.numPages
      setPdfProgress(100)
      
      console.log(`PDF validated: ${numPages} pages, ${file.size} bytes`)
      
    } catch (err) {
      console.error('PDF validation error:', err)
      setError('Invalid or corrupted PDF file. Please try a different file.')
      setPdfFile(null)
      setPdfProgress(0)
    } finally {
      setPdfProcessing(false)
    }
  }

  if (!user) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Please sign in to create quizzes</h2>
        <button
          onClick={() => navigate('/login')}
          className="text-blue-600 hover:text-blue-700"
        >
          Sign In →
        </button>
      </div>
    )
  }

  if (step === 'generating') {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full shadow-lg mb-4">
              <HiSparkles className="w-8 h-8 text-on-primary" />
            </div>
            <h1 className="text-3xl font-bold text-on-background mb-2">Creating Your Quiz</h1>
            <p className="text-on-background/60">AI is analyzing your material and generating questions...</p>
          </div>

          <div className="bg-surface rounded-2xl shadow-xl p-8 border border-gray-100">
            <LoadingSpinner size="lg" text="Generating your quiz with AI..." />
            <div className="mt-6 space-y-3">
              <div className="flex items-center text-sm text-on-background/70">
                <HiCheckCircle className="w-5 h-5 text-green-500 mr-3" />
                Processing your study material
              </div>
              <div className="flex items-center text-sm text-on-background/70">
                <HiCheckCircle className="w-5 h-5 text-green-500 mr-3" />
                Analyzing content for key concepts
              </div>
              <div className="flex items-center text-sm text-on-background/60 animate-pulse">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
                Generating quiz questions...
              </div>
            </div>
            <p className="text-center text-sm text-on-background/50 mt-6">
              This usually takes 10-30 seconds depending on content length
            </p>
          </div>
        </div>
      </div>
    )
  }



  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full shadow-lg mb-4">
            <HiSparkles className="w-8 h-8 text-on-primary" />
          </div>
          <h1 className="text-3xl font-bold text-on-background mb-2">Create New Quiz</h1>
          <p className="text-on-background/60">Transform your study materials into interactive quizzes</p>
        </div>

        {error && (
          <ErrorMessage
            message={error}
            onRetry={() => setError('')}
            onDismiss={() => setError('')}
          />
        )}

        <div className="bg-surface rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Material Type Selection */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-on-background mb-4">
              Choose Material Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { type: 'text' as const, icon: HiDocumentText, label: 'Text Content', desc: 'Paste or type your study material' },
                { type: 'pdf' as const, icon: HiCloudArrowUp, label: 'PDF File', desc: 'Upload a PDF document' },
                { type: 'url' as const, icon: HiLink, label: 'Web URL', desc: 'Extract content from a webpage' }
              ].map(({ type, icon: Icon, label, desc }) => (
                <button
                  key={type}
                  onClick={() => setMaterialType(type)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    materialType === type
                      ? 'border-primary bg-primary/10 shadow-lg transform scale-105'
                      : 'border-gray-200 bg-surface hover:border-primary/50 hover:shadow-md'
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-2 ${
                    materialType === type ? 'text-primary' : 'text-on-background/50'
                  }`} />
                  <div className="font-semibold text-on-background mb-1">{label}</div>
                  <div className="text-sm text-on-background/60">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Material Name */}
          <div className="mb-6">
            <label htmlFor="materialName" className="block text-sm font-semibold text-on-background mb-2">
              Material Name <span className="text-on-background/50">(Optional)</span>
            </label>
            <input
              type="text"
              id="materialName"
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-surface"
              placeholder="Give your material a descriptive name"
            />
          </div>

          {/* Material Content */}
          {materialType === 'text' && (
            <div className="mb-6">
              <label htmlFor="textContent" className="block text-sm font-semibold text-on-background mb-2">
                Study Material Content
              </label>
              <textarea
                id="textContent"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-surface resize-vertical"
                placeholder="Paste your study material, notes, or any text content here..."
                required
                maxLength={10000}
              />
              <div className="flex justify-between items-center mt-2 text-sm">
                <span className={`${textContent.length < 100 ? 'text-red-600' : 'text-on-background/60'}`}>
                  Minimum 100 characters required
                </span>
                <span className={`font-medium ${textContent.length > 9000 ? 'text-red-600' : 'text-on-background/60'}`}>
                  {textContent.length}/10,000
                </span>
              </div>
            </div>
          )}

          {materialType === 'url' && (
            <div className="mb-6">
              <label htmlFor="urlContent" className="block text-sm font-semibold text-on-background mb-2">
                Webpage URL
              </label>
              <input
                type="url"
                id="urlContent"
                value={urlContent}
                onChange={(e) => setUrlContent(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-surface"
                placeholder="https://example.com/article"
                required
              />
              <p className="text-sm text-amber-600 mt-2 flex items-center">
                <HiExclamationTriangle className="w-4 h-4 mr-1" />
                URL content extraction is not fully implemented yet
              </p>
            </div>
          )}

          {materialType === 'pdf' && (
            <div className="mb-6">
              <label htmlFor="pdfFile" className="block text-sm font-semibold text-on-background mb-2">
                PDF File
              </label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="pdfFile"
                  accept=".pdf"
                  onChange={(e) => handlePdfFileSelect(e.target.files?.[0] || null)}
                  className="hidden"
                  required
                />
                <label htmlFor="pdfFile" className="cursor-pointer">
                  <HiCloudArrowUp className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-on-background font-medium mb-1">Click to upload PDF</div>
                  <div className="text-sm text-on-background/60">or drag and drop</div>
                </label>
                {pdfFile && (
                  <div className="mt-4 p-2 bg-primary/10 rounded text-sm text-primary">
                    Selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(1)} MB)
                  </div>
                )}
                {pdfProcessing && (
                  <div className="mt-4">
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-sm text-primary font-medium">Processing PDF...</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${pdfProgress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-on-background/60 mt-1">{pdfProgress}% complete</div>
                  </div>
                )}
              </div>
              <p className="text-sm text-amber-600 mt-2 flex items-center">
                <HiExclamationTriangle className="w-4 h-4 mr-1" />
                URL content extraction is not fully implemented yet
              </p>
            </div>
          )}
          

          {/* Quiz Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div>
              <label htmlFor="questionCount" className="block text-sm font-semibold text-on-background mb-2">
                Number of Questions
              </label>
              <input
                type="number"
                id="questionCount"
                value={questionCount}
                onChange={(e) => setQuestionCount(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
                min={1}
                max={1000}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-surface"
                placeholder="Enter number of questions"
              />
              <p className="text-xs text-on-background/60 mt-1">
                Enter any number between 1-1000 questions
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-on-background mb-2">
                Difficulty Level
              </label>
              <div className="space-y-2">
                {[
                  { level: 'easy' as const, label: 'Easy', desc: 'Basic concepts & definitions' },
                  { level: 'medium' as const, label: 'Medium', desc: 'Intermediate understanding' },
                  { level: 'hard' as const, label: 'Hard', desc: 'Complex analysis & thinking' },
                  { level: 'technical' as const, label: 'Technical', desc: 'Expert-level knowledge' }
                ].map(({ level, label, desc }) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                      difficulty === level
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-gray-200 bg-surface hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium text-on-background">{label}</div>
                    <div className="text-sm text-on-background/60">{desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-1 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-on-background mb-2">
                Question Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { type: 'multiple-choice' as const, label: 'Multiple Choice', desc: '4 options per question' },
                  { type: 'true-false' as const, label: 'True/False', desc: 'Simple yes/no questions' }
                ].map(({ type, label, desc }) => (
                  <button
                    key={type}
                    onClick={() => setQuestionType(type)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                      questionType === type
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-gray-200 bg-surface hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium text-on-background">{label}</div>
                    <div className="text-sm text-on-background/60">{desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateQuiz}
            disabled={loading || (materialType === 'text' && textContent.trim().length < 100)}
            className="w-full inline-flex items-center justify-center px-8 py-10  font-semibold text-lg rounded-lg hover:from-primary/90 hover:to-secondary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Generating Quiz...
              </>
            ) : (
              <>
                <HiSparkles className="w-6 h-6 mr-3" />
                Generate Quiz with AI
              </>
            )}
          </button>

          <div className="text-center mt-4">
            <p className="text-sm text-on-background/60">
              {import.meta.env.VITE_GEMINI_API_KEY ?
                'AI-powered quiz generation with intelligent question creation' :
                'Sample questions will be generated (add API key for AI features)'
              }
            </p>
          </div>

          {materialType === 'text' && textContent.trim().length < 100 && textContent.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <HiExclamationTriangle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-sm text-red-800">
                  Please provide at least 100 characters of content to generate a meaningful quiz.
                </p>
              </div>
            </div>
          )}
          
          
        </div>
      </div>
    </div>
  )
}
          

export default CreateQuiz