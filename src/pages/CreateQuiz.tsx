

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
      
      // Try to load with PDF.js to validate
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