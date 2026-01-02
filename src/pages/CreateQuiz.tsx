// import React, { useState, useEffect } from 'react'
// import { useNavigate, useLocation } from 'react-router-dom'
// import { useAuth } from '../hooks/useAuth'
// import { quizService } from '../services/quizService'
// import { dataService } from '../services/dataService'
// import LoadingSpinner from '../components/LoadingSpinner'
// import ErrorMessage from '../components/ErrorMessage'
// import type { StudyMaterial } from '../types'
// import * as pdfjsLib from 'pdfjs-dist'
// import {
//   HiDocumentText,
//   HiLink,
//   HiCloudArrowUp,
//   HiCheckCircle,
//   HiSparkles,
//   HiExclamationTriangle
// } from 'react-icons/hi2'

// const CreateQuiz: React.FC = () => {
//   const { user } = useAuth()
//   const navigate = useNavigate()
//   const location = useLocation()
  
//   const [step, setStep] = useState<'material' | 'generating'>('material')
//   const [materialType, setMaterialType] = useState<'text' | 'pdf' | 'url'>('text')
//   const [materialName, setMaterialName] = useState('')
//   const [textContent, setTextContent] = useState('')
//   const [urlContent, setUrlContent] = useState('')
//   const [pdfFile, setPdfFile] = useState<File | null>(null)
//   const [questionCount, setQuestionCount] = useState(10)
//   const [questionType, setQuestionType] = useState<'multiple-choice' | 'true-false'>('multiple-choice')
//   const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'technical'>('medium')
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [pdfProcessing, setPdfProcessing] = useState(false)
//   const [pdfProgress, setPdfProgress] = useState(0)

//   // Check if we have a pre-selected material from dashboard
//   useEffect(() => {
//     const selectedMaterial = location.state?.selectedMaterial as StudyMaterial
//     if (selectedMaterial) {
//       setMaterialType(selectedMaterial.type)
//       setMaterialName(selectedMaterial.name)
//       if (selectedMaterial.type === 'text') {
//         setTextContent(selectedMaterial.content)
//       } else if (selectedMaterial.type === 'url') {
//         setUrlContent(selectedMaterial.content)
//       }
//     }
//   }, [location.state])

//   const handleGenerateQuiz = async () => {
//     if (!user) return

//     setLoading(true)
//     setError('')
//     setStep('generating')

//     try {
//       let content = ''
//       let name = materialName || 'Untitled Material'

//       // Prepare content based on type
//       if (materialType === 'text') {
//         content = textContent
//       } else if (materialType === 'url') {
//         content = await quizService.extractTextFromURL(urlContent)
//         name = name || urlContent
//       } else if (materialType === 'pdf' && pdfFile) {
//         setPdfProcessing(true)
//         setPdfProgress(10)
//         content = await quizService.extractTextFromPDF(pdfFile)
//         setPdfProgress(100)
//         setPdfProcessing(false)
//         name = name || pdfFile.name
//       }

//       if (!content.trim()) {
//         throw new Error('Please provide some content to generate a quiz from')
//       }

//       // Create study material
//       const material: StudyMaterial = {
//         id: crypto.randomUUID(),
//         type: materialType,
//         content,
//         name,
//         uploadedAt: new Date().toISOString()
//       }

//       // Save the material
//       await dataService.saveMaterial(material, user.id)

//       // Generate quiz
//       const quiz = await quizService.generateQuiz(material, questionCount, questionType, difficulty)
      
//       // Save the quiz and navigate directly to take it
//       await dataService.saveQuiz(quiz, user.id)
//       navigate(`/quiz/${quiz.id}`)
//     } catch (err) {
//       const error = err as Error
//       setError(error.message || 'Failed to generate quiz')
//       setStep('material')
//     } finally {
//       setLoading(false)
//     }
//   }



//   const handlePdfFileSelect = async (file: File | null) => {
//     if (!file) {
//       setPdfFile(null)
//       setPdfProgress(0)
//       return
//     }

//     // Validate file type
//     if (!file.type.includes('pdf')) {
//       setError('Please select a valid PDF file')
//       return
//     }

//     // Validate file size (50MB limit)
//     if (file.size > 50 * 1024 * 1024) {
//       setError('PDF file size must be less than 50MB')
//       return
//     }

//     setPdfFile(file)
//     setPdfProcessing(true)
//     setPdfProgress(10)
//     setError('')

//     try {
//       // Simulate processing progress
//       setPdfProgress(30)
      
//       // Basic validation - check if file can be read
//       const arrayBuffer = await file.arrayBuffer()
//       setPdfProgress(60)
      
//       // Try to load with PDF.js to validate
//       const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
//       setPdfProgress(90)
      
//       // Get basic info
//       const numPages = pdf.numPages
//       setPdfProgress(100)
      
//       console.log(`PDF validated: ${numPages} pages, ${file.size} bytes`)
      
//     } catch (err) {
//       console.error('PDF validation error:', err)
//       setError('Invalid or corrupted PDF file. Please try a different file.')
//       setPdfFile(null)
//       setPdfProgress(0)
//     } finally {
//       setPdfProcessing(false)
//     }
//   }

//   if (!user) {
//     return (
//       <div className="text-center">
//         <h2 className="text-2xl font-bold mb-4">Please sign in to create quizzes</h2>
//         <button
//           onClick={() => navigate('/login')}
//           className="text-blue-600 hover:text-blue-700"
//         >
//           Sign In →
//         </button>
//       </div>
//     )
//   }

//   if (step === 'generating') {
//     return (
//       <div className="min-h-screen bg-background">
//         <div className="max-w-2xl mx-auto px-4 py-8">
//           <div className="text-center mb-8">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full shadow-lg mb-4">
//               <HiSparkles className="w-8 h-8 text-on-primary" />
//             </div>
//             <h1 className="text-3xl font-bold text-on-background mb-2">Creating Your Quiz</h1>
//             <p className="text-on-background/60">AI is analyzing your material and generating questions...</p>
//           </div>

//           <div className="bg-gradient-to-br from-white via-yellow-50 to-green-50 rounded-2xl shadow-xl p-8 border border-yellow-200/50">
//             <LoadingSpinner size="lg" text="Generating your quiz with AI..." />
//             <div className="mt-6 space-y-3">
//               <div className="flex items-center text-sm text-on-background/70">
//                 <HiCheckCircle className="w-5 h-5 text-green-500 mr-3" />
//                 Processing your study material
//               </div>
//               <div className="flex items-center text-sm text-on-background/70">
//                 <HiCheckCircle className="w-5 h-5 text-green-500 mr-3" />
//                 Analyzing content for key concepts
//               </div>
//               <div className="flex items-center text-sm text-on-background/60 animate-pulse">
//                 <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3"></div>
//                 Generating quiz questions...
//               </div>
//             </div>
//             <p className="text-center text-sm text-on-background/50 mt-6">
//               This usually takes 10-30 seconds depending on content length
//             </p>
//           </div>
//         </div>
//       </div>
//     )
//   }



//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-4xl mx-auto container-padding">
//         <div className="text-center mb-12 animate-fade-in">
//           <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl shadow-large mb-6">
//             <HiSparkles className="w-10 h-10 text-white" />
//           </div>
//           <h1 className="text-4xl font-bold text-yellow-800 mb-3">Create New Quiz</h1>
//           <p className="text-xl text-green-700 max-w-2xl mx-auto">Transform your study materials into interactive quizzes with AI-powered question generation</p>
//         </div>

//         {error && (
//           <ErrorMessage
//             message={error}
//             onRetry={() => setError('')}
//             onDismiss={() => setError('')}
//           />
//         )}

//         <div className="card card-hover p-8 lg:p-10">
//           {/* Material Type Selection */}
//           <div className="mb-10">
//             <label className="form-label text-lg mb-6">
//               Choose Material Type
//             </label>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {[
//                 { type: 'text' as const, icon: HiDocumentText, label: 'Text Content', desc: 'Paste or type your study material' },
//                 { type: 'pdf' as const, icon: HiCloudArrowUp, label: 'PDF File', desc: 'Upload a PDF document' },
//                 { type: 'url' as const, icon: HiLink, label: 'Web URL', desc: 'Extract content from a webpage' }
//               ].map(({ type, icon: Icon, label, desc }) => (
//                 <button
//                   key={type}
//                   onClick={() => setMaterialType(type)}
//                   className={`p-6 rounded-xl border-2 transition-all duration-300 text-left group ${
//                     materialType === type
//                       ? 'border-primary-300 bg-primary-50 shadow-medium transform scale-105'
//                       : 'border-gray-200 bg-white hover:border-primary-200 hover:shadow-soft hover:-translate-y-1'
//                   }`}
//                 >
//                   <Icon className={`w-8 h-8 mb-4 transition-colors ${
//                     materialType === type ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500'
//                   }`} />
//                   <div className={`text-lg font-semibold mb-2 transition-colors ${
//                     materialType === type ? 'text-primary-900' : 'text-gray-900'
//                   }`}>{label}</div>
//                   <div className="text-sm text-gray-600 leading-relaxed">{desc}</div>
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Material Name */}
//           <div className="mb-8">
//             <label htmlFor="materialName" className="form-label">
//               Material Name <span className="text-gray-500 font-normal">(Optional)</span>
//             </label>
//             <input
//               type="text"
//               id="materialName"
//               value={materialName}
//               onChange={(e) => setMaterialName(e.target.value)}
//               className="form-input"
//               placeholder="Give your material a descriptive name"
//             />
//           </div>

//           {/* Material Content */}
//           {materialType === 'text' && (
//             <div className="mb-8">
//               <label htmlFor="textContent" className="form-label">
//                 Study Material Content
//               </label>
//               <textarea
//                 id="textContent"
//                 value={textContent}
//                 onChange={(e) => setTextContent(e.target.value)}
//                 rows={10}
//                 className="form-input resize-vertical min-h-[200px]"
//                 placeholder="Paste your study material, notes, or any text content here..."
//                 required
//                 maxLength={10000}
//               />
//               <div className="flex justify-between items-center mt-3 text-sm">
//                 <span className={`${textContent.length < 100 ? 'text-error-600' : 'text-gray-600'}`}>
//                   Minimum 100 characters required
//                 </span>
//                 <span className={`font-medium ${textContent.length > 9000 ? 'text-error-600' : 'text-gray-600'}`}>
//                   {textContent.length}/10,000
//                 </span>
//               </div>
//             </div>
//           )}

//           {materialType === 'text' && textContent.trim().length >= 100 && (
//             <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg">
//               <div className="flex items-center">
//                 <HiCheckCircle className="w-5 h-5 text-success-600 mr-3" />
//                 <p className="text-sm text-success-800">
//                   Content looks good! Ready to generate your quiz.
//                 </p>
//               </div>
//             </div>
//           )}

//           {materialType === 'url' && (
//             <div className="mb-8">
//               <label htmlFor="urlContent" className="form-label">
//                 Webpage URL
//               </label>
//               <input
//                 type="url"
//                 id="urlContent"
//                 value={urlContent}
//                 onChange={(e) => setUrlContent(e.target.value)}
//                 className="form-input"
//                 placeholder="https://example.com/article"
//                 required
//               />
//               <p className="text-sm text-warning-600 mt-3 flex items-center">
//                 <HiExclamationTriangle className="w-4 h-4 mr-2" />
//                 URL content extraction is not fully implemented yet
//               </p>
//             </div>
//           )}

//           {materialType === 'pdf' && (
//             <div className="mb-8">
//               <label htmlFor="pdfFile" className="form-label">
//                 PDF File
//               </label>
//               <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors bg-gray-50/50">
//                 <input
//                   type="file"
//                   id="pdfFile"
//                   accept=".pdf"
//                   onChange={(e) => handlePdfFileSelect(e.target.files?.[0] || null)}
//                   className="hidden"
//                   required
//                 />
//                 <label htmlFor="pdfFile" className="cursor-pointer">
//                   <HiCloudArrowUp className="w-12 h-12 text-primary-500 mx-auto mb-4" />
//                   <div className="text-gray-900 font-semibold text-lg mb-2">Click to upload PDF</div>
//                   <div className="text-gray-600">or drag and drop</div>
//                 </label>
//                 {pdfFile && (
//                   <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
//                     <div className="flex items-center justify-center space-x-2 text-primary-700">
//                       <HiDocumentText className="w-5 h-5" />
//                       <span className="font-medium">{pdfFile.name}</span>
//                       <span className="text-sm text-primary-600">({(pdfFile.size / 1024 / 1024).toFixed(1)} MB)</span>
//                     </div>
//                   </div>
//                 )}
//                 {pdfProcessing && (
//                   <div className="mt-6">
//                     <div className="flex items-center justify-center mb-4">
//                       <div className="spinner w-6 h-6 mr-3"></div>
//                       <span className="text-primary-700 font-medium">Processing PDF...</span>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
//                       <div
//                         className="bg-primary-500 h-3 rounded-full transition-all duration-500 shadow-sm progress-bar"
//                         style={{ width: `${pdfProgress}%` }}
//                       ></div>
//                     </div>
//                     <div className="text-xs text-gray-600 mt-2 text-center font-medium">{pdfProgress}% complete</div>
//                   </div>
//                 )}
//               </div>
//               <p className="text-sm text-gray-500 mt-3">Maximum file size: 50MB. Supported format: PDF</p>
//             </div>
//           )}
          

//           {/* Quiz Settings */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
//             <div>
//               <label htmlFor="questionCount" className="form-label">
//                 Number of Questions
//               </label>
//               <input
//                 type="number"
//                 id="questionCount"
//                 value={questionCount}
//                 onChange={(e) => setQuestionCount(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
//                 min={1}
//                 max={1000}
//                 className="form-input"
//                 placeholder="Enter number of questions"
//               />
//               <p className="text-xs text-gray-600 mt-2">
//                 Enter any number between 1-1000 questions
//               </p>
//             </div>

//             <div>
//               <label className="form-label">
//                 Difficulty Level
//               </label>
//               <div className="space-y-3">
//                 {[
//                   { level: 'easy' as const, label: 'Easy', desc: 'Basic concepts & definitions' },
//                   { level: 'medium' as const, label: 'Medium', desc: 'Intermediate understanding' },
//                   { level: 'hard' as const, label: 'Hard', desc: 'Complex analysis & thinking' },
//                   { level: 'technical' as const, label: 'Technical', desc: 'Expert-level knowledge' }
//                 ].map(({ level, label, desc }) => (
//                   <button
//                     key={level}
//                     onClick={() => setDifficulty(level)}
//                     className={`w-full p-4 rounded-lg border-2 transition-all duration-300 text-left group ${
//                       difficulty === level
//                         ? 'border-primary-300 bg-primary-50 shadow-medium transform scale-105'
//                         : 'border-gray-200 bg-white hover:border-primary-200 hover:shadow-soft'
//                     }`}
//                   >
//                     <div className={`text-base font-semibold mb-1 transition-colors ${
//                       difficulty === level ? 'text-primary-900' : 'text-gray-900'
//                     }`}>{label}</div>
//                     <div className="text-sm text-gray-600 leading-relaxed">{desc}</div>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-10">
//             <div>
//               <label className="form-label">
//                 Question Type
//               </label>
//               <div className="grid grid-cols-2 gap-6">
//                 {[
//                   { type: 'multiple-choice' as const, label: 'Multiple Choice', desc: '4 options per question' },
//                   { type: 'true-false' as const, label: 'True/False', desc: 'Simple yes/no questions' }
//                 ].map(({ type, label, desc }) => (
//                   <button
//                     key={type}
//                     onClick={() => setQuestionType(type)}
//                     className={`p-6 rounded-xl border-2 transition-all duration-300 text-left group ${
//                       questionType === type
//                         ? 'border-primary-300 bg-primary-50 shadow-medium transform scale-105'
//                         : 'border-gray-200 bg-white hover:border-primary-200 hover:shadow-soft'
//                     }`}
//                   >
//                     <div className={`text-lg font-semibold mb-2 transition-colors ${
//                       questionType === type ? 'text-primary-900' : 'text-gray-900'
//                     }`}>{label}</div>
//                     <div className="text-sm text-gray-600 leading-relaxed">{desc}</div>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Generate Button */}
//           <button
//             onClick={handleGenerateQuiz}
//             disabled={loading || (materialType === 'text' && textContent.trim().length < 100)}
//             className="btn-primary w-full py-6 text-xl font-bold shadow-large hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-soft"
//           >
//             {loading ? (
//               <>
//                 <div className="spinner w-7 h-7 mr-4"></div>
//                 Generating Quiz...
//               </>
//             ) : (
//               <>
//                 <HiSparkles className="w-7 h-7 mr-4" />
//                 Generate Quiz with AI
//               </>
//             )}
//           </button>

//           <div className="text-center mt-6">
//             <p className="text-sm text-gray-600">
//               AI-powered quiz generation with intelligent question creation
//             </p>
//           </div>

//           {materialType === 'text' && textContent.trim().length < 100 && textContent.length > 0 && (
//             <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
//               <div className="flex items-center">
//                 <HiExclamationTriangle className="w-5 h-5 text-error-600 mr-3" />
//                 <p className="text-sm text-error-800">
//                   Please provide at least 100 characters of content to generate a meaningful quiz.
//                 </p>
//               </div>
//             </div>
//           )}
          
          
//         </div>
//       </div>
//     </div>
//   )
// }
          

// export default CreateQuiz

import React, { useState, useEffect, useMemo } from 'react'
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

  useEffect(() => {
    const selectedMaterial = location.state?.selectedMaterial as StudyMaterial
    if (selectedMaterial) {
      setMaterialType(selectedMaterial.type)
      setMaterialName(selectedMaterial.name)
      if (selectedMaterial.type === 'text') setTextContent(selectedMaterial.content)
      else if (selectedMaterial.type === 'url') setUrlContent(selectedMaterial.content)
    }
  }, [location.state])

  const canGenerate = useMemo(() => {
    if (loading) return false
    if (materialType === 'text') return textContent.trim().length >= 100
    if (materialType === 'url') return urlContent.trim().length > 8
    if (materialType === 'pdf') return !!pdfFile && !pdfProcessing
    return false
  }, [loading, materialType, textContent, urlContent, pdfFile, pdfProcessing])

  const handleGenerateQuiz = async () => {
    if (!user) return

    setLoading(true)
    setError('')
    setStep('generating')

    try {
      let content = ''
      let name = materialName || 'Untitled Material'

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

      if (!content.trim()) throw new Error('Please provide some content to generate a quiz from')

      const material: StudyMaterial = {
        id: crypto.randomUUID(),
        type: materialType,
        content,
        name,
        uploadedAt: new Date().toISOString()
      }

      await dataService.saveMaterial(material, user.id)

      const quiz = await quizService.generateQuiz(material, questionCount, questionType, difficulty)

      await dataService.saveQuiz(quiz, user.id)
      navigate(`/quiz/${quiz.id}`)
    } catch (err) {
      const e = err as Error
      setError(e.message || 'Failed to generate quiz')
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

    if (!file.type.includes('pdf')) {
      setError('Please select a valid PDF file')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('PDF file size must be less than 50MB')
      return
    }

    setPdfFile(file)
    setPdfProcessing(true)
    setPdfProgress(10)
    setError('')

    try {
      setPdfProgress(30)
      const arrayBuffer = await file.arrayBuffer()
      setPdfProgress(60)

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      setPdfProgress(90)

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
      <div className="qa-empty qa-fadeIn">
        <div className="qa-card qa-card__pad qa-empty__card">
          <div className="qa-empty__icon" aria-hidden="true">
            <HiSparkles className="qa-ico qa-ico--lg" />
          </div>
          <h2 className="qa-empty__title">Sign in required</h2>
          <p className="qa-empty__text">Please sign in to create quizzes.</p>
          <button onClick={() => navigate('/login')} className="qa-btn qa-btn--primary qa-btn--full qa-btn--xl">
            Sign In
          </button>
        </div>
      </div>
    )
  }

  if (step === 'generating') {
    return (
      <div className="qa-create qa-fadeIn">
        <header className="qa-pageHeader">
          <div className="qa-heroIcon" aria-hidden="true">
            <HiSparkles className="qa-ico qa-ico--lg" />
          </div>
          <div>
            <h1 className="qa-pageTitle">Creating your quiz</h1>
            <p className="qa-pageSubtitle">AI is analyzing your material and generating questions.</p>
          </div>
        </header>

        <section className="qa-card qa-card__pad">
          <LoadingSpinner size="lg" text="Generating your quiz with AI..." />

          <div className="qa-steps" aria-label="Generation steps">
            <div className="qa-step">
              <HiCheckCircle className="qa-ico qa-ico--btn qa-step__ok" />
              <span>Processing your study material</span>
            </div>
            <div className="qa-step">
              <HiCheckCircle className="qa-ico qa-ico--btn qa-step__ok" />
              <span>Finding key concepts</span>
            </div>
            <div className="qa-step qa-step--pending">
              <span className="qa-inlineSpin" aria-hidden="true" />
              <span>Generating quiz questions</span>
            </div>
          </div>

          <p className="qa-help qa-center" style={{ marginTop: 10 }}>
            Tip: longer content creates higher-quality questions.
          </p>
        </section>
      </div>
    )
  }

  return (
    <div className="qa-create qa-fadeIn">
      <header className="qa-pageHeader">
        <div className="qa-heroIcon" aria-hidden="true">
          <HiSparkles className="qa-ico qa-ico--lg" />
        </div>
        <div>
          <h1 className="qa-pageTitle">Create new quiz</h1>
          <p className="qa-pageSubtitle">Turn notes, PDFs, and web pages into interactive quizzes.</p>
        </div>
      </header>

      {error && <ErrorMessage message={error} onDismiss={() => setError('')} onRetry={() => setError('')} />}

      <section className="qa-card qa-card__pad">
        {/* Material type */}
        <div className="qa-section">
          <div className="qa-sectionHead">
            <h2 className="qa-sectionTitle">Study material</h2>
            <p className="qa-sectionDesc">Choose a source, then provide the content.</p>
          </div>

          <div className="qa-choiceGrid qa-choiceGrid--3" role="radiogroup" aria-label="Material type">
            {[
              { type: 'text' as const, icon: HiDocumentText, label: 'Text', desc: 'Paste your notes' },
              { type: 'pdf' as const, icon: HiCloudArrowUp, label: 'PDF', desc: 'Upload a document' },
              { type: 'url' as const, icon: HiLink, label: 'URL', desc: 'Extract from a page' }
            ].map(({ type, icon: Icon, label, desc }) => {
              const active = materialType === type
              return (
                <button
                  key={type}
                  type="button"
                  className={`qa-choiceCard ${active ? 'qa-choiceCard--active' : ''}`}
                  onClick={() => setMaterialType(type)}
                  aria-pressed={active}
                >
                  <div className="qa-choiceCard__top">
                    <div className={`qa-choiceCard__icon ${active ? 'qa-choiceCard__icon--active' : ''}`}>
                      <Icon className="qa-ico qa-ico--lg" />
                    </div>
                    <div className="qa-choiceCard__label">{label}</div>
                  </div>
                  <div className="qa-choiceCard__desc">{desc}</div>
                </button>
              )
            })}
          </div>

          <div className="qa-grid2">
            <div className="qa-field">
              <label htmlFor="materialName" className="qa-label">
                Material name <span className="qa-label__opt">(optional)</span>
              </label>
              <input
                id="materialName"
                className="qa-input"
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
                placeholder="e.g. Photosynthesis — Chapter 4"
              />
              <div className="qa-help">This shows up on your Dashboard.</div>
            </div>
          </div>

          {materialType === 'text' && (
            <div className="qa-field">
              <label htmlFor="textContent" className="qa-label">
                Paste your study content <span className="qa-label__req">*</span>
              </label>
              <textarea
                id="textContent"
                className="qa-textarea"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste notes, textbook excerpts, definitions, etc."
                rows={10}
                maxLength={10000}
              />
              <div className="qa-helperRow">
                <span className={`qa-help ${textContent.trim().length >= 100 ? 'qa-help--ok' : 'qa-help--bad'}`}>
                  Minimum 100 characters
                </span>
                <span className={`qa-help ${textContent.length > 9000 ? 'qa-help--bad' : ''}`}>
                  {textContent.length}/10,000
                </span>
              </div>

              {textContent.trim().length >= 100 && (
                <div className="qa-callout qa-callout--success">
                  <HiCheckCircle className="qa-ico qa-ico--btn" />
                  <span>Content looks good. Ready to generate.</span>
                </div>
              )}
            </div>
          )}

          {materialType === 'url' && (
            <div className="qa-field">
              <label htmlFor="urlContent" className="qa-label">
                Webpage URL <span className="qa-label__req">*</span>
              </label>
              <input
                id="urlContent"
                className="qa-input"
                type="url"
                value={urlContent}
                onChange={(e) => setUrlContent(e.target.value)}
                placeholder="https://example.com/article"
              />
              <div className="qa-callout qa-callout--warn">
                <HiExclamationTriangle className="qa-ico qa-ico--btn" />
                <span>URL extraction depends on the website and may not work for all pages.</span>
              </div>
            </div>
          )}

          {materialType === 'pdf' && (
            <div className="qa-field">
              <label className="qa-label">
                PDF upload <span className="qa-label__req">*</span>
              </label>

              <div className="qa-upload">
                <input
                  type="file"
                  id="pdfFile"
                  accept=".pdf"
                  className="qa-upload__input"
                  onChange={(e) => handlePdfFileSelect(e.target.files?.[0] || null)}
                />
                <label htmlFor="pdfFile" className="qa-upload__label">
                  <HiCloudArrowUp className="qa-ico qa-ico--lg" />
                  <div className="qa-upload__title">Click to upload</div>
                  <div className="qa-upload__sub">PDF up to 50MB</div>
                </label>

                {pdfFile && (
                  <div className="qa-upload__fileInfo">
                    <HiDocumentText className="qa-ico qa-ico--btn" />
                    <span className="qa-truncate" title={pdfFile.name}>
                      {pdfFile.name}
                    </span>
                    <span className="qa-upload__fileMeta">
                      ({(pdfFile.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                )}

                {pdfProcessing && (
                  <div className="qa-upload__progress">
                    <div className="qa-upload__progressTop">
                      <span className="qa-inlineSpin" aria-hidden="true" />
                      <span className="qa-help">Validating PDF…</span>
                      <span className="qa-help">{pdfProgress}%</span>
                    </div>
                    <div className="qa-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pdfProgress}>
                      <div className="qa-progress__fill" style={{ width: `${pdfProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="qa-help">Tip: scanned PDFs (images) may not extract text well.</div>
            </div>
          )}
        </div>

        {/* Quiz settings */}
        <div className="qa-section">
          <div className="qa-sectionHead">
            <h2 className="qa-sectionTitle">Quiz settings</h2>
            <p className="qa-sectionDesc">Tune the quiz to match your goals.</p>
          </div>

          <div className="qa-grid2">
            <div className="qa-field">
              <label htmlFor="questionCount" className="qa-label">
                Number of questions
              </label>
              <input
                id="questionCount"
                className="qa-input"
                type="number"
                value={questionCount}
                min={1}
                max={1000}
                onChange={(e) => setQuestionCount(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
              />
              <div className="qa-help">1–1000 supported (more questions takes longer).</div>
            </div>

            <div className="qa-field">
              <div className="qa-label">Difficulty</div>
              <div className="qa-pillRow" role="radiogroup" aria-label="Difficulty">
                {(['easy', 'medium', 'hard', 'technical'] as const).map((lvl) => {
                  const active = difficulty === lvl
                  return (
                    <button
                      key={lvl}
                      type="button"
                      className={`qa-pill ${active ? 'qa-pill--active' : ''}`}
                      onClick={() => setDifficulty(lvl)}
                      aria-pressed={active}
                    >
                      {lvl}
                    </button>
                  )
                })}
              </div>
              <div className="qa-help">
                Technical is best for dense content (STEM, law, medicine, programming).
              </div>
            </div>
          </div>

          <div className="qa-field" style={{ marginTop: 6 }}>
            <div className="qa-label">Question type</div>
            <div className="qa-choiceGrid qa-choiceGrid--2" role="radiogroup" aria-label="Question type">
              {[
                { type: 'multiple-choice' as const, label: 'Multiple choice', desc: '4 options per question' },
                { type: 'true-false' as const, label: 'True/False', desc: 'Fast review mode' }
              ].map((q) => {
                const active = questionType === q.type
                return (
                  <button
                    key={q.type}
                    type="button"
                    className={`qa-choiceCard ${active ? 'qa-choiceCard--active' : ''}`}
                    onClick={() => setQuestionType(q.type)}
                    aria-pressed={active}
                  >
                    <div className="qa-choiceCard__top">
                      <div className="qa-choiceCard__label">{q.label}</div>
                    </div>
                    <div className="qa-choiceCard__desc">{q.desc}</div>
                  </button>
                )
              })}
            </div>
          </div>

          <button
            onClick={handleGenerateQuiz}
            disabled={!canGenerate}
            className="qa-btn qa-btn--primary qa-btn--full qa-btn--xl"
            style={{ marginTop: 18 }}
          >
            <HiSparkles className="qa-ico qa-ico--lg" />
            Generate quiz with AI
          </button>

          {!canGenerate && materialType === 'text' && textContent.length > 0 && textContent.trim().length < 100 && (
            <div className="qa-callout qa-callout--danger" style={{ marginTop: 14 }}>
              <HiExclamationTriangle className="qa-ico qa-ico--btn" />
              <span>Please provide at least 100 characters for meaningful questions.</span>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default CreateQuiz