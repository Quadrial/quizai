import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { studyAssistantService } from '../services/studyAssistantService'
import ErrorMessage from '../components/ErrorMessage'
import {
  HiCloudArrowUp,
  HiDocumentText,
  HiSpeakerWave,
  HiPause,
  HiPlay,
  HiSparkles,
  HiLightBulb,
  HiAcademicCap,
  HiPhoto,
  HiArrowPath,
  HiCheckCircle,
  HiBeaker,
  HiClipboardDocumentList
} from 'react-icons/hi2'

interface KeyPoint {
  title: string
  explanation: string
  types?: string[]
  examples: string[]
  importance: string
}

interface ExamQuestion {
  type: 'multiple-choice' | 'true-false'
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  topic: string
}

interface StudyContent {
  originalContent: string
  keyPoints: KeyPoint[]
  examQuestions: ExamQuestion[]
  detailedExplanation: string
  visualAids: { description: string; concept: string; imageUrl?: string }[]
}

const StudyAssistant: React.FC = () => {
  const { user } = useAuth()
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState('')
  const [error, setError] = useState('')
  const [studyContent, setStudyContent] = useState<StudyContent | null>(null)
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSection, setCurrentSection] = useState<string>('')
  const [audioProgress, setAudioProgress] = useState(0)
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<number>(0)

  // Highlighting state
  const [highlightedWord, setHighlightedWord] = useState<number>(-1)
  const [highlightedSection, setHighlightedSection] = useState<string>('')
  const textRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const wordsArrayRef = useRef<Map<string, string[]>>(new Map())

  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 })

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()
      console.log('Available voices:', availableVoices.length)
      
      if (availableVoices.length > 0) {
        setVoices(availableVoices)
        
        let selectedIndex = 0
        
        const preferredVoice = availableVoices.findIndex(voice => 
          voice.lang.startsWith('en') && 
          (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Natural'))
        )
        
        if (preferredVoice !== -1) {
          selectedIndex = preferredVoice
        } else {
          const anyEnglishVoice = availableVoices.findIndex(voice => 
            voice.lang.startsWith('en')
          )
          if (anyEnglishVoice !== -1) {
            selectedIndex = anyEnglishVoice
          }
        }
        
        setSelectedVoice(selectedIndex)
        console.log('Selected voice:', availableVoices[selectedIndex]?.name)
      }
    }

    loadVoices()
    
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
    
    return () => {
      window.speechSynthesis.cancel()
    }
  }, [])

  const handlePdfSelect = async (file: File | null) => {
    if (!file) {
      setPdfFile(null)
      setProgress(0)
      setProgressMessage('')
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
    setError('')
    setStudyContent(null)
  }

  const handleAnalyze = async () => {
    if (!pdfFile || !user) return

    setLoading(true)
    setProcessing(true)
    setError('')
    setProgress(0)

    try {
      const content = await studyAssistantService.analyzePDF(
        pdfFile,
        (prog, msg) => {
          setProgress(prog)
          setProgressMessage(msg)
        }
      )

      setStudyContent(content)
      setProgress(100)
      setProgressMessage('Analysis complete!')
    } catch (err) {
      const error = err as Error
      console.error('Analysis error:', error)
      
      let errorMessage = error.message || 'Failed to analyze PDF'
      
      if (errorMessage.includes('sufficient text')) {
        errorMessage = `${errorMessage}

Possible reasons:
• The PDF might be scanned images without text layer
• The PDF might be empty or corrupted
• The file might be password-protected

Try:
• Using a different PDF with clear text
• Ensuring the PDF has selectable text`
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
      setTimeout(() => setProcessing(false), 500)
    }
  }

  const speakText = useCallback((text: string, section: string, startFromBeginning: boolean = false) => {
  window.speechSynthesis.cancel()

  if (isPlaying && currentSection === section && !startFromBeginning) {
    setIsPlaying(false)
    setCurrentSection('')
    setHighlightedWord(-1)
    setHighlightedSection('')
    return
  }

  if (!window.speechSynthesis) {
    setError('Text-to-speech is not supported in your browser.')
    return
  }

  // Better text formatting that preserves meaning
  const cleanText = text
    // Fix stuck words first
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([.!?:;,])([A-Z])/g, '$1 $2')
    .replace(/(\d)([A-Z])/g, '$1 $2')
    // Then handle line breaks
    .replace(/\n\s*\n/g, '. ')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    // Fix common abbreviations
    .replace(/D N A/g, 'DNA')
    .replace(/R N A/g, 'RNA')
    .replace(/U S A/g, 'USA')
    .replace(/P H D/g, 'PhD')
    .replace(/M D/g, 'MD')
    .trim()

  // Split text into words for highlighting
  const words = cleanText.split(/\s+/).filter(w => w.length > 0)
  wordsArrayRef.current.set(section, words)

  console.log(`🎤 Speaking section: ${section}, word count: ${words.length}`)
  console.log('📝 Sample text:', cleanText.substring(0, 200))

  const utterance = new SpeechSynthesisUtterance(cleanText)
  
  if (voices.length > 0 && voices[selectedVoice]) {
    utterance.voice = voices[selectedVoice]
  }
  
  utterance.rate = 0.85
  utterance.pitch = 1
  utterance.volume = 1
  utterance.lang = 'en-US'


  utterance.onstart = () => {
    setIsPlaying(true)
    setCurrentSection(section)
    setHighlightedSection(section)
    setHighlightedWord(0)
    setError('')
    console.log('▶️ Speech started for section:', section)
  }

  // ... rest of the function

  utterance.onend = () => {
    setIsPlaying(false)
    setCurrentSection('')
    setAudioProgress(0)
    setHighlightedWord(-1)
    setHighlightedSection('')
    console.log('⏹️ Speech ended')
  }

  utterance.onerror = (event) => {
    console.error('❌ Speech synthesis error:', event)
    setIsPlaying(false)
    setCurrentSection('')
    setHighlightedWord(-1)
    setHighlightedSection('')
    setError('Speech synthesis failed. Please try again.')
  }

  utterance.onboundary = (event) => {
  if (event.name === 'word') {
    // More accurate word tracking
    const charIndex = event.charIndex
    let currentWordIndex = 0
    let charCount = 0
    
    // Find which word we're at based on character position
    for (let i = 0; i < words.length; i++) {
      if (charCount >= charIndex) {
        currentWordIndex = i
        break
      }
      charCount += words[i].length + 1 // +1 for space
    }
    
    // Ensure we don't go beyond array bounds
    if (currentWordIndex >= words.length) {
      currentWordIndex = words.length - 1
    }
    
    console.log(`📍 Word ${currentWordIndex}/${words.length}: "${words[currentWordIndex]}" at char ${charIndex}`)
    setHighlightedWord(currentWordIndex)
    // REMOVED: wordIndex = currentWordIndex  <-- Delete this line
    
    // Auto-scroll to highlighted word with better positioning
    const element = textRefs.current.get(section)
    if (element) {
      const wordElements = element.querySelectorAll('.word-highlight')
      if (wordElements[currentWordIndex]) {
        const wordElement = wordElements[currentWordIndex] as HTMLElement
        
        // Scroll the word into view with smooth behavior
        wordElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        })
        
        // Also ensure parent container scrolls
        const container = element.closest('.qa-readingBox')
        if (container) {
          const containerRect = container.getBoundingClientRect()
          const wordRect = wordElement.getBoundingClientRect()
          
          // If word is not fully visible, scroll container
          if (wordRect.top < containerRect.top || wordRect.bottom > containerRect.bottom) {
            const scrollTop = wordElement.offsetTop - container.clientHeight / 2
            container.scrollTo({ top: scrollTop, behavior: 'smooth' })
          }
        }
      }
    }
  }
  
  // Update progress
  if (cleanText.length > 0) {
    const progress = (event.charIndex / cleanText.length) * 100
    setAudioProgress(Math.min(progress, 100))
  }
}

  speechSynthesisRef.current = utterance
  
  try {
    window.speechSynthesis.speak(utterance)
  } catch (err) {
    console.error('Error starting speech:', err)
    setError('Could not start speech synthesis. Please try again.')
    setIsPlaying(false)
    setCurrentSection('')
    setHighlightedWord(-1)
    setHighlightedSection('')
  }
}, [voices, selectedVoice, isPlaying, currentSection])

const HighlightedText: React.FC<{
  text: string
  section: string
  isActive: boolean
}> = ({ text, section, isActive }) => {
  const formattedText = text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([.!?:;,])([A-Z])/g, '$1 $2')
    .replace(/(\d)([A-Z])/g, '$1 $2')
    .replace(/ +/g, ' ')
    .trim()

  const paragraphs = formattedText.split(/\n\s*\n/).filter((p) => p.trim().length > 0)

  const handleWordClick = useCallback((globalWordIndex: number) => {
    console.log(`🖱️ Clicked word index: ${globalWordIndex}`)
    
    let existing = wordsArrayRef.current.get(section) || []
    if (existing.length === 0) {
      const allWords = formattedText
        .replace(/\n\s*\n/g, '. ')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0)
      wordsArrayRef.current.set(section, allWords)
      existing = allWords
    }

    const textFromWord = existing.slice(globalWordIndex).join(' ')
    console.log(`🎯 Starting from: "${existing[globalWordIndex]}"`)
    
    // Pass true to indicate we're starting from a clicked word
    speakText(textFromWord, section, true)
  }, [formattedText, section])

  let globalWordIndex = 0

  return (
    <div
      ref={(el) => {
        if (el) textRefs.current.set(section, el)
      }}
      className="qa-reading"
    >
      {paragraphs.map((paragraph, pIndex) => {
        const words = paragraph
          .replace(/\s+/g, ' ')
          .trim()
          .split(/\s+/)
          .filter((w) => w.length > 0)

        const paragraphStartIndex = globalWordIndex

        return (
          <p key={pIndex} className="qa-reading__p">
            {words.map((word, wIndex) => {
              const currentGlobalIndex = paragraphStartIndex + wIndex
              const highlight = isActive && highlightedWord === currentGlobalIndex
              const alreadyRead = isActive && highlightedWord > currentGlobalIndex && highlightedWord !== -1

              globalWordIndex++

              return (
                <React.Fragment key={`${pIndex}-${wIndex}`}>
                  <span
                    onClick={() => handleWordClick(currentGlobalIndex)}
                    className={[
                      'word-highlight',
                      'qa-word',
                      highlight ? 'qa-word--active' : '',
                      alreadyRead ? 'qa-word--read' : ''
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    title="Click to start reading from here"
                    data-word-index={currentGlobalIndex}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {word}
                  </span>
                  {wIndex < words.length - 1 ? ' ' : null}
                </React.Fragment>
              )
            })}
          </p>
        )
      })}
    </div>
  )
}

  const stopAllAudio = () => {
    try {
      window.speechSynthesis.cancel()
    } catch (err) {
      console.error('Error stopping speech:', err)
    }
    setIsPlaying(false)
    setCurrentSection('')
    setAudioProgress(0)
    setHighlightedWord(-1)
    setHighlightedSection('')
  }

  const speakAll = () => {
    if (!studyContent) return

    const explanationSample = studyContent.detailedExplanation.substring(0, 3000)
    speakText(explanationSample, 'all')
  }

  const handleQuizAnswer = (answerIndex: number) => {
    if (!studyContent) return
    
    setSelectedAnswer(answerIndex)
    setShowExplanation(true)
    
    const currentQuestion = studyContent.examQuestions[currentQuestionIndex]
    if (answerIndex === currentQuestion.correctAnswer) {
      setQuizScore(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }))
    } else {
      setQuizScore(prev => ({ ...prev, total: prev.total + 1 }))
    }
  }

  const nextQuestion = () => {
    if (!studyContent) return
    
    if (currentQuestionIndex < studyContent.examQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      alert(`Quiz Complete! Your score: ${quizScore.correct + (selectedAnswer === studyContent.examQuestions[currentQuestionIndex].correctAnswer ? 1 : 0)}/${quizScore.total + 1}`)
      setShowQuiz(false)
      setCurrentQuestionIndex(0)
      setQuizScore({ correct: 0, total: 0 })
      setSelectedAnswer(null)
      setShowExplanation(false)
    }
  }

  return (
  <div className="qa-studyWrap qa-fadeIn">
    {!user ? (
      <div className="qa-empty">
        <div className="qa-card qa-card__pad qa-empty__card">
          <div className="qa-empty__icon" aria-hidden="true">
            <HiAcademicCap className="qa-ico qa-ico--lg" />
          </div>
          <h2 className="qa-empty__title">Sign in required</h2>
          <p className="qa-empty__text">Please sign in to use the AI Study Assistant.</p>
          <a href="/login" className="qa-btn qa-btn--primary qa-btn--full qa-btn--xl">
            Sign In
          </a>
        </div>
      </div>
    ) : (
      <>
        <header className="qa-pageHeader qa-pageHeader--split">
          <div className="qa-pageHeader__left">
            <div className="qa-heroIcon qa-heroIcon--sa" aria-hidden="true">
              <HiAcademicCap className="qa-ico qa-ico--lg" />
            </div>
            <div className="qa-truncate">
              <h1 className="qa-pageTitle">AI Study Assistant</h1>
              <p className="qa-pageSubtitle">Upload a PDF and get explanations, key points, practice questions, and narration.</p>
            </div>
          </div>
        </header>

        {error && (
          <div className="qa-stack" style={{ marginBottom: 14 }}>
            <ErrorMessage message={error} onRetry={() => setError('')} onDismiss={() => setError('')} />
          </div>
        )}

        {!studyContent ? (
          <section className="qa-card qa-card__pad">
            <div className="qa-sectionHead">
              <h2 className="qa-sectionTitle">Upload PDF</h2>
              <p className="qa-sectionDesc">PDF up to 50MB. Scanned PDFs may not extract text well.</p>
            </div>

            <div className="qa-upload">
              <input
                type="file"
                id="saPdf"
                accept=".pdf"
                onChange={(e) => handlePdfSelect(e.target.files?.[0] || null)}
                className="qa-upload__input"
              />
              <label htmlFor="saPdf" className="qa-upload__label">
                <HiCloudArrowUp className="qa-ico qa-ico--lg" />
                <div className="qa-upload__title">Click to upload PDF</div>
                <div className="qa-upload__sub">We’ll analyze and generate a study pack</div>
              </label>

              {pdfFile && (
                <div className="qa-upload__fileInfo">
                  <HiDocumentText className="qa-ico qa-ico--btn" />
                  <span className="qa-truncate" title={pdfFile.name}>
                    {pdfFile.name}
                  </span>
                  <span className="qa-upload__fileMeta">({(pdfFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                </div>
              )}

              {processing && (
                <div className="qa-upload__progress">
                  <div className="qa-upload__progressTop">
                    <span className="qa-inlineSpin" aria-hidden="true" />
                    <span className="qa-help">{progressMessage}</span>
                    <span className="qa-help">{progress}%</span>
                  </div>
                  <div className="qa-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                    <div className="qa-progress__fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!pdfFile || loading}
              className="qa-btn qa-btn--primary qa-btn--full qa-btn--xl"
              style={{ marginTop: 16 }}
            >
              {loading ? (
                <>
                  <span className="qa-inlineSpin" aria-hidden="true" />
                  Analyzing…
                </>
              ) : (
                <>
                  <HiSparkles className="qa-ico qa-ico--lg" />
                  Analyze with AI
                </>
              )}
            </button>
          </section>
        ) : showQuiz ? (
          <section className="qa-card qa-card__pad qa-practiceCard">
            <div className="qa-practiceTop">
              <div>
                <h2 className="qa-sectionTitle" style={{ margin: 0 }}>Practice Quiz</h2>
                <div className="qa-help">Score: {quizScore.correct}/{quizScore.total}</div>
              </div>

              <button
                className="qa-btn qa-btn--surface"
                onClick={() => {
                  setShowQuiz(false)
                  setCurrentQuestionIndex(0)
                  setSelectedAnswer(null)
                  setShowExplanation(false)
                  setQuizScore({ correct: 0, total: 0 })
                }}
              >
                Exit
              </button>
            </div>

            {studyContent.examQuestions.length > 0 && (
              <>
                <div className="qa-progress qa-progress--sm" style={{ marginTop: 12 }}>
                  <div
                    className="qa-progress__fill"
                    style={{ width: `${((currentQuestionIndex + 1) / studyContent.examQuestions.length) * 100}%` }}
                  />
                </div>

                {(() => {
                  const question = studyContent.examQuestions[currentQuestionIndex]
                  const ok = selectedAnswer === question.correctAnswer

                  return (
                    <div style={{ marginTop: 14 }}>
                      <div className="qa-callout qa-callout--info">
                        <div className="qa-callout__body">
                          <div className="qa-callout__title">
                            {question.type === 'multiple-choice' ? 'Multiple choice' : 'True/False'} • {question.topic}
                          </div>
                          <div className="qa-callout__text">{question.question}</div>
                        </div>
                      </div>

                      <div className="qa-answerList" style={{ marginTop: 12 }}>
                        {question.options.map((opt, idx) => {
                          const btnClass = [
                            'qa-answer',
                            showExplanation
                              ? idx === question.correctAnswer
                                ? 'qa-answer--correct'
                                : idx === selectedAnswer
                                  ? 'qa-answer--wrong'
                                  : 'qa-answer--muted'
                              : selectedAnswer === idx
                                ? 'qa-answer--selected'
                                : ''
                          ].join(' ')

                          return (
                            <button
                              key={idx}
                              onClick={() => !showExplanation && handleQuizAnswer(idx)}
                              disabled={showExplanation}
                              className={btnClass}
                              type="button"
                            >
                              <div className="qa-answer__letter" aria-hidden="true">{String.fromCharCode(65 + idx)}</div>
                              <div className="qa-answer__text">{opt}</div>
                              <div className="qa-answer__right" aria-hidden="true">
                                {showExplanation && idx === question.correctAnswer ? <HiCheckCircle className="qa-ico qa-ico--btn" /> : null}
                                {showExplanation && idx === selectedAnswer && idx !== question.correctAnswer ? <HiPause className="qa-ico qa-ico--btn" /> : null}
                              </div>
                            </button>
                          )
                        })}
                      </div>

                      {showExplanation && (
                        <div className={`qa-callout ${ok ? 'qa-callout--success' : 'qa-callout--danger'}`} style={{ marginTop: 12 }}>
                          <div className="qa-callout__body">
                            <div className="qa-callout__title">{ok ? 'Correct' : 'Incorrect'}</div>
                            <div className="qa-callout__text">{question.explanation}</div>
                            <div className="qa-callout__actions">
                              <button className="qa-btn qa-btn--primary" onClick={nextQuestion}>
                                {currentQuestionIndex < studyContent.examQuestions.length - 1 ? 'Next' : 'Finish'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </>
            )}
          </section>
        ) : (
          <div className="qa-studySections">
            {/* Toolbar */}
            <section className="qa-card qa-card__pad">
              <div className="qa-actionGrid">
                <button onClick={speakAll} className="qa-btn qa-btn--primary">
                  {isPlaying && currentSection === 'all' ? <HiPause className="qa-ico qa-ico--btn" /> : <HiPlay className="qa-ico qa-ico--btn" />}
                  {isPlaying && currentSection === 'all' ? 'Pause reading' : 'Read explanation'}
                </button>

                <button onClick={() => setShowQuiz(true)} className="qa-btn qa-btn--surface">
                  <HiClipboardDocumentList className="qa-ico qa-ico--btn" />
                  Practice questions
                </button>

                <button onClick={stopAllAudio} className="qa-btn qa-btn--danger">
                  <HiPause className="qa-ico qa-ico--btn" />
                  Stop audio
                </button>

                <button
                  onClick={() => {
                    setPdfFile(null)
                    setStudyContent(null)
                    setProgress(0)
                    setProgressMessage('')
                    setShowQuiz(false)
                    setCurrentQuestionIndex(0)
                    setSelectedAnswer(null)
                    setShowExplanation(false)
                    setQuizScore({ correct: 0, total: 0 })
                    stopAllAudio()
                  }}
                  className="qa-btn qa-btn--surface"
                >
                  <HiArrowPath className="qa-ico qa-ico--btn" />
                  New document
                </button>
              </div>

              {voices.length > 0 && (
                <div className="qa-grid2" style={{ marginTop: 14 }}>
                  <div className="qa-field">
                    <label className="qa-label">Voice</label>
                    <select
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(Number(e.target.value))}
                      className="qa-select"
                    >
                      {voices.map((voice, i) => (
                        <option key={i} value={i}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                    </select>
                    <div className="qa-help">Tip: “Natural” voices usually sound best.</div>
                  </div>

                  <div className="qa-field">
                    <div className="qa-label">Audio progress</div>
                    <div className="qa-progress qa-progress--sm">
                      <div className="qa-progress__fill" style={{ width: `${audioProgress}%` }} />
                    </div>
                    <div className="qa-help">
                      {isPlaying ? `Reading: ${currentSection} • ${Math.round(audioProgress)}%` : 'Not playing'}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Original content */}
            <section className="qa-card qa-card__pad">
              <div className="qa-cardHead">
                <div className="qa-cardHead__title">
                  <HiDocumentText className="qa-ico qa-ico--lg" />
                  <h2 className="qa-cardTitle">Original document (excerpt)</h2>
                </div>
                <button
                  className="qa-iconBtn"
                  onClick={() => speakText(studyContent.originalContent.substring(0, 3000), 'original')}
                  title="Listen"
                  type="button"
                >
                  {isPlaying && currentSection === 'original' ? <HiPause className="qa-ico qa-ico--btn" /> : <HiSpeakerWave className="qa-ico qa-ico--btn" />}
                </button>
              </div>

              <div className="qa-readingBox">
                <HighlightedText
                  text={studyContent.originalContent.substring(0, 3000)}
                  section="original"
                  isActive={highlightedSection === 'original'}
                />
              </div>
              <div className="qa-help qa-center" style={{ marginTop: 10 }}>
                Tip: click any word to start reading from that point.
              </div>
            </section>

            {/* Key points */}
            <section className="qa-card qa-card__pad">
              <div className="qa-cardHead">
                <div className="qa-cardHead__title">
                  <HiCheckCircle className="qa-ico qa-ico--lg" />
                  <h2 className="qa-cardTitle">Key points</h2>
                </div>
              </div>

              <div className="qa-pointList">
                {studyContent.keyPoints.map((p, idx) => (
                  <div key={idx} className="qa-point">
                    <div className="qa-pointHead">
                      <h3 className="qa-pointTitle">{p.title}</h3>
                      <button
                        className="qa-iconBtn"
                        type="button"
                        onClick={() =>
                          speakText(
                            `${p.title}. ${p.explanation}. ${p.types ? 'Types: ' + p.types.join(', ') + '.' : ''} Examples: ${p.examples.join(', ')}. Importance: ${p.importance}`,
                            `keypoint-${idx}`
                          )
                        }
                        title="Listen"
                      >
                        {isPlaying && currentSection === `keypoint-${idx}` ? (
                          <HiPause className="qa-ico qa-ico--btn" />
                        ) : (
                          <HiSpeakerWave className="qa-ico qa-ico--btn" />
                        )}
                      </button>
                    </div>

                    <p className="qa-text">{p.explanation}</p>

                    {p.types?.length ? (
                      <>
                        <div className="qa-subHead">
                          <HiBeaker className="qa-ico qa-ico--btn" /> Types
                        </div>
                        <ul className="qa-bullets">
                          {p.types.map((t, tIdx) => <li key={tIdx}>{t}</li>)}
                        </ul>
                      </>
                    ) : null}

                    {p.examples?.length ? (
                      <>
                        <div className="qa-subHead">
                          <HiLightBulb className="qa-ico qa-ico--btn" /> Examples
                        </div>
                        <ul className="qa-bullets">
                          {p.examples.map((ex, exIdx) => <li key={exIdx}>{ex}</li>)}
                        </ul>
                      </>
                    ) : null}

                    <div className="qa-callout qa-callout--warn" style={{ marginTop: 12 }}>
                      <div className="qa-callout__body">
                        <div className="qa-callout__title">Why this matters</div>
                        <div className="qa-callout__text">{p.importance}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Detailed explanation */}
            <section className="qa-card qa-card__pad">
              <div className="qa-cardHead">
                <div className="qa-cardHead__title">
                  <HiAcademicCap className="qa-ico qa-ico--lg" />
                  <h2 className="qa-cardTitle">Detailed explanation</h2>
                </div>
                <button
                  className="qa-iconBtn"
                  onClick={() => speakText(studyContent.detailedExplanation, 'explanation')}
                  title="Listen"
                  type="button"
                >
                  {isPlaying && currentSection === 'explanation' ? <HiPause className="qa-ico qa-ico--btn" /> : <HiSpeakerWave className="qa-ico qa-ico--btn" />}
                </button>
              </div>

              <div className="qa-readingBox qa-readingBox--tall">
                <HighlightedText
                  text={studyContent.detailedExplanation}
                  section="explanation"
                  isActive={highlightedSection === 'explanation'}
                />
              </div>

              <div className="qa-help qa-center" style={{ marginTop: 10 }}>
                Tip: click any word to start reading from that point.
              </div>
            </section>

            {/* Visual aids */}
            {studyContent.visualAids.length > 0 && (
              <section className="qa-card qa-card__pad">
                <div className="qa-cardHead">
                  <div className="qa-cardHead__title">
                    <HiPhoto className="qa-ico qa-ico--lg" />
                    <h2 className="qa-cardTitle">Visual aids</h2>
                  </div>
                </div>

                <div className="qa-visualGrid">
                  {studyContent.visualAids.map((a, i) => (
                    <div key={i} className="qa-visualCard">
                      <div className="qa-visualTitle">{a.concept}</div>
                      <div className="qa-visualDesc">{a.description}</div>

                      {a.imageUrl ? (
                        <img src={a.imageUrl} alt={a.concept} className="qa-visualImg" />
                      ) : (
                        <div className="qa-visualPlaceholder">
                          <HiPhoto className="qa-ico qa-ico--lg" />
                          <div className="qa-help">Diagram placeholder</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Exam questions */}
            <section className="qa-card qa-card__pad">
              <div className="qa-cardHead">
                <div className="qa-cardHead__title">
                  <HiClipboardDocumentList className="qa-ico qa-ico--lg" />
                  <h2 className="qa-cardTitle">Practice questions</h2>
                </div>
              </div>

              <p className="qa-help" style={{ marginTop: 6 }}>
                {studyContent.examQuestions.length} questions generated across the document topics.
              </p>

              <button onClick={() => setShowQuiz(true)} className="qa-btn qa-btn--primary qa-btn--full qa-btn--xl" style={{ marginTop: 12 }}>
                <HiClipboardDocumentList className="qa-ico qa-ico--lg" />
                Start practice quiz
              </button>
            </section>
          </div>
        )}
      </>
    )}
  </div>
)
}

export default StudyAssistant