import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { quizService } from '../services/quizService'
import { dataService } from '../services/dataService'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { testGeminiAPI } from '../utils/testGemini'
import type { StudyMaterial } from '../types'
import {
  HiDocumentText,
  HiLink,
  HiCloudArrowUp,
  HiCheckCircle,
  HiArrowRight,
  HiSparkles,
  HiExclamationTriangle,
  HiKey,
  HiPlay
} from 'react-icons/hi2'

const CreateQuiz: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [step, setStep] = useState<'material' | 'generating' | 'preview'>('material')
  const [materialType, setMaterialType] = useState<'text' | 'pdf' | 'url'>('text')
  const [materialName, setMaterialName] = useState('')
  const [textContent, setTextContent] = useState('')
  const [urlContent, setUrlContent] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [questionCount, setQuestionCount] = useState(10)
  const [questionType, setQuestionType] = useState<'multiple-choice' | 'true-false'>('multiple-choice')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null)
  const [apiTestResult, setApiTestResult] = useState('')

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
        content = await quizService.extractTextFromPDF(pdfFile)
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
      const quiz = await quizService.generateQuiz(material, questionCount, questionType)
      setGeneratedQuiz(quiz)
      setStep('preview')
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Failed to generate quiz')
      setStep('material')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveQuiz = async () => {
    if (!generatedQuiz || !user) return

    setLoading(true)
    try {
      await dataService.saveQuiz(generatedQuiz, user.id)
      navigate('/dashboard')
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Failed to save quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleTakeQuiz = async () => {
    if (!generatedQuiz || !user) return

    setLoading(true)
    try {
      await dataService.saveQuiz(generatedQuiz, user.id)
      navigate(`/quiz/${generatedQuiz.id}`)
    } catch (err) {
      const error = err as Error
      setError(error.message || 'Failed to save quiz')
    } finally {
      setLoading(false)
    }
  }

  const handleTestAPI = async () => {
    setApiTestResult('Testing...')
    const result = await testGeminiAPI()
    if (result.success) {
      setApiTestResult('✅ API key is working!')
    } else {
      setApiTestResult(`❌ API Error: ${result.error}`)
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
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full shadow-lg mb-4">
              <HiSparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-primary-900 mb-2">Creating Your Quiz</h1>
            <p className="text-primary-600">AI is analyzing your material and generating questions...</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-primary-100">
            <LoadingSpinner size="lg" text="Generating your quiz with AI..." />
            <div className="mt-6 space-y-3">
              <div className="flex items-center text-sm text-primary-700">
                <HiCheckCircle className="w-5 h-5 text-green-500 mr-3" />
                Processing your study material
              </div>
              <div className="flex items-center text-sm text-primary-700">
                <HiCheckCircle className="w-5 h-5 text-green-500 mr-3" />
                Analyzing content for key concepts
              </div>
              <div className="flex items-center text-sm text-primary-600 animate-pulse">
                <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                Generating quiz questions...
              </div>
            </div>
            <p className="text-center text-sm text-primary-500 mt-6">
              This usually takes 10-30 seconds depending on content length
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'preview' && generatedQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-lg mb-4">
              <HiCheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-primary-900 mb-2">Quiz Preview</h1>
            <p className="text-primary-600">Review your generated quiz before saving</p>
          </div>

          {error && (
            <ErrorMessage
              message={error}
              onRetry={() => setStep('material')}
              onDismiss={() => setError('')}
            />
          )}

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-primary-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-primary-900">{generatedQuiz.title}</h2>
                <p className="text-primary-600 mt-1">{generatedQuiz.questions.length} questions • {questionType === 'multiple-choice' ? 'Multiple Choice' : 'True/False'}</p>
              </div>
              <div className="flex items-center text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
                <HiExclamationTriangle className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Preview Mode</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Correct answers are hidden to maintain quiz integrity. Answers will be revealed after students complete the quiz.
              </p>
            </div>

            <div className="space-y-6">
              {generatedQuiz.questions.map((question: any, index: number) => (
                <div key={question.id} className="border-b border-primary-100 pb-6 last:border-b-0">
                  <h3 className="text-lg font-semibold text-primary-900 mb-4 flex items-start">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{question.question}</span>
                  </h3>
                  <div className="ml-11 space-y-3">
                    {question.options.map((option: string, optionIndex: number) => (
                      <div
                        key={optionIndex}
                        className="flex items-center p-3 rounded-lg bg-primary-50 border border-primary-100 hover:bg-primary-100 transition-colors"
                      >
                        <span className="flex-shrink-0 w-6 h-6 bg-white border-2 border-primary-300 rounded-full flex items-center justify-center text-xs font-bold text-primary-700 mr-3">
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <span className="text-primary-800">{option}</span>
                      </div>
                    ))}
                  </div>
                  {question.explanation && (
                    <div className="ml-11 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleTakeQuiz}
              disabled={loading}
              className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <HiPlay className="w-5 h-5 mr-2" />
                  Save & Take Quiz
                </>
              )}
            </button>
            <button
              onClick={handleSaveQuiz}
              disabled={loading}
              className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <HiCheckCircle className="w-5 h-5 mr-2" />
                  Save Quiz
                </>
              )}
            </button>
            <button
              onClick={() => setStep('material')}
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary-700 font-semibold rounded-lg border-2 border-primary-200 hover:bg-primary-50 hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <HiArrowRight className="w-5 h-5 mr-2 rotate-180" />
              Back to Edit
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full shadow-lg mb-4">
            <HiSparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-primary-900 mb-2">Create New Quiz</h1>
          <p className="text-primary-600">Transform your study materials into interactive quizzes</p>
        </div>

        {error && (
          <ErrorMessage
            message={error}
            onRetry={() => setError('')}
            onDismiss={() => setError('')}
          />
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-primary-100">
          {/* API Test Section */}
          <div className="mb-8 p-6 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-100">
            <div className="flex items-center mb-4">
              <HiKey className="w-5 h-5 text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-primary-900">API Configuration</h3>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
              <button
                onClick={handleTestAPI}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200"
              >
                Test Gemini API
              </button>
              {apiTestResult && (
                <span className="text-sm text-primary-700 font-medium">{apiTestResult}</span>
              )}
            </div>

            {!import.meta.env.VITE_GEMINI_API_KEY && (
              <div className="flex items-start p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <HiExclamationTriangle className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">API Key Required</p>
                  <p>Add <code className="bg-amber-100 px-1 py-0.5 rounded text-xs">VITE_GEMINI_API_KEY</code> to your .env file to enable AI quiz generation.</p>
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium mt-2"
                  >
                    Get your free API key <HiArrowRight className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>
            )}

            {import.meta.env.VITE_GEMINI_API_KEY && import.meta.env.VITE_GEMINI_API_KEY.length < 35 && (
              <div className="flex items-start p-4 bg-red-50 border border-red-200 rounded-lg">
                <HiExclamationTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-1">Invalid API Key</p>
                  <p>Gemini API keys are typically 39 characters long. Please check your key.</p>
                </div>
              </div>
            )}
          </div>

          {/* Material Type Selection */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-primary-900 mb-4">
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
                      ? 'border-primary-500 bg-primary-50 shadow-lg transform scale-105'
                      : 'border-primary-200 bg-white hover:border-primary-300 hover:shadow-md'
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-2 ${
                    materialType === type ? 'text-primary-600' : 'text-primary-500'
                  }`} />
                  <div className="font-semibold text-primary-900 mb-1">{label}</div>
                  <div className="text-sm text-primary-600">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Material Name */}
          <div className="mb-6">
            <label htmlFor="materialName" className="block text-sm font-semibold text-primary-900 mb-2">
              Material Name <span className="text-primary-500">(Optional)</span>
            </label>
            <input
              type="text"
              id="materialName"
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white"
              placeholder="Give your material a descriptive name"
            />
          </div>

          {/* Material Content */}
          {materialType === 'text' && (
            <div className="mb-6">
              <label htmlFor="textContent" className="block text-sm font-semibold text-primary-900 mb-2">
                Study Material Content
              </label>
              <textarea
                id="textContent"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white resize-vertical"
                placeholder="Paste your study material, notes, or any text content here..."
                required
                maxLength={10000}
              />
              <div className="flex justify-between items-center mt-2 text-sm">
                <span className={`${textContent.length < 100 ? 'text-red-600' : 'text-primary-600'}`}>
                  Minimum 100 characters required
                </span>
                <span className={`font-medium ${textContent.length > 9000 ? 'text-red-600' : 'text-primary-600'}`}>
                  {textContent.length}/10,000
                </span>
              </div>
            </div>
          )}

          {materialType === 'url' && (
            <div className="mb-6">
              <label htmlFor="urlContent" className="block text-sm font-semibold text-primary-900 mb-2">
                Webpage URL
              </label>
              <input
                type="url"
                id="urlContent"
                value={urlContent}
                onChange={(e) => setUrlContent(e.target.value)}
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white"
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
              <label htmlFor="pdfFile" className="block text-sm font-semibold text-primary-900 mb-2">
                PDF File
              </label>
              <div className="border-2 border-dashed border-primary-200 rounded-lg p-6 text-center hover:border-primary-300 transition-colors">
                <input
                  type="file"
                  id="pdfFile"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  className="hidden"
                  required
                />
                <label htmlFor="pdfFile" className="cursor-pointer">
                  <HiCloudArrowUp className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                  <div className="text-primary-900 font-medium mb-1">Click to upload PDF</div>
                  <div className="text-sm text-primary-600">or drag and drop</div>
                </label>
                {pdfFile && (
                  <div className="mt-4 p-2 bg-primary-50 rounded text-sm text-primary-700">
                    Selected: {pdfFile.name}
                  </div>
                )}
              </div>
              <p className="text-sm text-amber-600 mt-2 flex items-center">
                <HiExclamationTriangle className="w-4 h-4 mr-1" />
                PDF text extraction is not fully implemented yet
              </p>
            </div>
          )}

          {/* Quiz Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div>
              <label htmlFor="questionCount" className="block text-sm font-semibold text-primary-900 mb-2">
                Number of Questions
              </label>
              <input
                type="number"
                id="questionCount"
                value={questionCount}
                onChange={(e) => setQuestionCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                min={1}
                max={100}
                className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white"
                placeholder="Enter number of questions"
              />
              <p className="text-xs text-primary-600 mt-1">
                Enter any number between 1-100 questions
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-900 mb-2">
                Question Type
              </label>
              <div className="space-y-2">
                {[
                  { type: 'multiple-choice' as const, label: 'Multiple Choice', desc: '4 options per question' },
                  { type: 'true-false' as const, label: 'True/False', desc: 'Simple yes/no questions' }
                ].map(({ type, label, desc }) => (
                  <button
                    key={type}
                    onClick={() => setQuestionType(type)}
                    className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                      questionType === type
                        ? 'border-primary-500 bg-gray-300 shadow-md'
                        : 'border-primary-200 bg-white hover:border-primary-300'
                    }`}
                  >
                    <div className="font-medium text-primary-900">{label}</div>
                    <div className="text-sm text-primary-600">{desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerateQuiz}
            disabled={loading || (materialType === 'text' && textContent.trim().length < 100)}
            className="w-full inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-black font-semibold text-lg rounded-lg hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
            <p className="text-sm text-primary-600">
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