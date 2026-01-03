import { GoogleGenerativeAI } from '@google/generative-ai'
import * as pdfjsLib from 'pdfjs-dist'
import { tesseractService } from './tesseractService'

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '')

interface ProgressCallback {
  (progress: number, message: string): void
}

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

export const studyAssistantService = {
  async analyzePDF(
    file: File,
    progressCallback?: ProgressCallback
  ): Promise<StudyContent> {
    try {
      progressCallback?.(5, 'Loading PDF...')
      
      // Extract text from PDF with OCR support
      const text = await this.extractTextFromPDFWithOCR(file, (prog, msg) => {
        progressCallback?.(5 + prog * 0.35, msg)
      })

      console.log('Extracted text length:', text.length)
      console.log('First 500 chars:', text.substring(0, 500))

      if (!text || text.trim().length < 100) {
        throw new Error('Could not extract sufficient text from PDF. The PDF might be empty, image-only, or corrupted.')
      }

      progressCallback?.(40, 'Analyzing content with AI...')

      // Generate study content using Gemini AI
      const studyContent = await this.generateStudyContent(text, (prog) => {
        progressCallback?.(40 + prog * 0.5, 'Generating study materials...')
      })

      // Generate images for visual aids
      progressCallback?.(90, 'Generating visual diagrams...')
      await this.generateImages(studyContent)

      progressCallback?.(100, 'Analysis complete!')
      
      return studyContent
    } catch (error) {
      console.error('PDF analysis error:', error)
      const err = error as Error
      throw new Error(err.message || 'Failed to analyze PDF. Please try again.')
    }
  },

  async extractTextFromPDFWithOCR(
  file: File,
  progressCallback?: (progress: number, message: string) => void
): Promise<string> {
  progressCallback?.(10, 'Reading PDF structure...')
  
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const numPages = pdf.numPages
  
  progressCallback?.(20, `Processing ${numPages} pages...`)

  let pagesProcessed = 0

  const pagePromises = Array.from({ length: numPages }, (_, i) =>
    pdf.getPage(i + 1).then(page =>
      this._processPage(page, i + 1, (msg: string) => {
        progressCallback?.(20 + (pagesProcessed / numPages) * 60, msg)
      }).finally(() => {
        pagesProcessed++
        progressCallback?.(
          20 + (pagesProcessed / numPages) * 60,
          `Processed page ${pagesProcessed}/${numPages}`
        )
      })
    )
  )

  const pageResults = await Promise.allSettled(pagePromises)
  const pageTexts: string[] = []
  let failedPages = 0
  
  pageResults.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      pageTexts.push(result.value)
    } else {
      console.error(`Error processing page ${index + 1}:`, result.reason)
      pageTexts.push(`[--- OCR failed for page ${index + 1} ---]`)
      failedPages++
    }
  })

  let fullText = pageTexts.join('\n\n')

  if (failedPages > 0) {
    throw new Error(`OCR processing failed or timed out for ${failedPages} out of ${numPages} pages. The extracted text may be incomplete.`)
  }

  progressCallback?.(80, 'Finalizing text extraction...')
  
  // Improved text cleaning that preserves spacing
  fullText = fullText
    // First, handle common PDF artifacts
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n') // Normalize line endings
    // Fix words that are stuck together by adding space before capital letters
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Fix missing spaces after punctuation
    .replace(/([.!?:;,])([A-Z])/g, '$1 $2')
    // Fix missing spaces after numbers
    .replace(/(\d)([A-Z])/g, '$1 $2')
    // Normalize multiple spaces to single space
    .replace(/ +/g, ' ')
    // Remove excessive line breaks (more than 2)
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  console.log('Total extracted text length:', fullText.length)
  console.log('Sample of extracted text:', fullText.substring(0, 500))
  
  return fullText
},

async _processPage(
  page: pdfjsLib.PDFPageProxy,
  pageNum: number,
  progressCallback?: (message: string) => void
): Promise<string> {
  const ocrThreshold = 100
  const textContent = await page.getTextContent()
  
  // Improved text extraction with proper spacing
  let pageText = ''
  let lastY = -1
  let lastX = -1
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  textContent.items.forEach((item: any) => {
    if (!item.str) return
    
    const currentY = item.transform[5]
    const currentX = item.transform[4]
    
    // Add line break if Y position changed significantly (new line)
    if (lastY !== -1 && Math.abs(currentY - lastY) > 5) {
      pageText += '\n'
    }
    // Add space if on same line but X gap is significant
    else if (lastX !== -1 && lastY !== -1 && Math.abs(currentY - lastY) <= 5) {
      const xGap = currentX - lastX
      // If there's a gap, add space
      if (xGap > 2) {
        pageText += ' '
      }
    }
    
    pageText += item.str
    lastY = currentY
    lastX = currentX + (item.width || 0)
  })
  
  pageText = pageText.trim()
  
  if (pageText.length < ocrThreshold) {
    progressCallback?.(
      `Page ${pageNum}: Scanning with OCR (image-based content)...`
    )
    
    try {
      const scale = 2.0 // Reduced scale for better performance
      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const context = canvas.getContext('2d')
      
      if (!context) {
        return pageText
      }
      
      await page.render({ canvasContext: context, viewport }).promise
      
      this._preprocessCanvasForOCR(canvas)

      const imageBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob from canvas'))
          }
        }, 'image/png', 0.95)
      })
      
      const ocrText = await tesseractService.performOCR(imageBlob)
      
      if (ocrText.trim().length > 20) {
        return ocrText
      }
    } catch (ocrError) {
      console.error(`OCR failed for page ${pageNum}:`, ocrError)
    }
  }
  
  return pageText
},

_preprocessCanvasForOCR(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    // Grayscale
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
    data[i] = avg
    data[i + 1] = avg
    data[i + 2] = avg

    // Binarization (Thresholding)
    const threshold = 128
    const pixelValue = data[i] < threshold ? 0 : 255
    data[i] = pixelValue
    data[i + 1] = pixelValue
    data[i + 2] = pixelValue
  }
  ctx.putImageData(imageData, 0, 0)
},

  async generateImages(studyContent: StudyContent): Promise<void> {
    // Generate simple educational diagrams using an API or placeholder
    // For now, we'll use a simple approach with canvas or placeholder service
    
    for (let i = 0; i < studyContent.visualAids.length; i++) {
      const aid = studyContent.visualAids[i]
      
      try {
        // Generate a simple diagram placeholder
        // You can replace this with actual image generation API like DALL-E, Stability AI, etc.
        const imageUrl = await this.createDiagramPlaceholder(aid.concept, aid.description)
        studyContent.visualAids[i].imageUrl = imageUrl
      } catch (error) {
        console.error('Error generating image:', error)
        // Keep it without image if generation fails
      }
    }
  },

  // Fix the wrapText function call - remove the 4th parameter
async createDiagramPlaceholder(concept: string, description: string): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      resolve('')
      return
    }

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 800, 600)
    gradient.addColorStop(0, '#f3e7ff')
    gradient.addColorStop(1, '#e0f2fe')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 800, 600)

    // Border
    ctx.strokeStyle = '#8b5cf6'
    ctx.lineWidth = 4
    ctx.strokeRect(10, 10, 780, 580)

    // Title
    ctx.fillStyle = '#581c87'
    ctx.font = 'bold 32px Arial'
    ctx.textAlign = 'center'
    const conceptText = this.wrapText(ctx, concept, 400)
    conceptText.forEach((line, index) => {
      ctx.fillText(line, 400, 60 + (index * 40))
    })

    // Description - FIXED: removed the 4th parameter
    ctx.fillStyle = '#4c1d95'
    ctx.font = '18px Arial'
    const descLines = this.wrapText(ctx, description, 700) // Removed the 4th parameter
    descLines.forEach((line, index) => {
      ctx.fillText(line, 400, 150 + (index * 30))
    })

    // Draw simple diagram elements
    ctx.strokeStyle = '#8b5cf6'
    ctx.lineWidth = 3
    
    // Central circle
    ctx.beginPath()
    ctx.arc(400, 400, 80, 0, Math.PI * 2)
    ctx.fillStyle = '#a78bfa'
    ctx.fill()
    ctx.stroke()
    
    // Surrounding circles
    const positions = [
      { x: 250, y: 300 },
      { x: 550, y: 300 },
      { x: 250, y: 500 },
      { x: 550, y: 500 }
    ]
    
    positions.forEach(pos => {
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 60, 0, Math.PI * 2)
      ctx.fillStyle = '#c4b5fd'
      ctx.fill()
      ctx.stroke()
      
      // Connect to center
      ctx.beginPath()
      ctx.moveTo(400, 400)
      ctx.lineTo(pos.x, pos.y)
      ctx.strokeStyle = '#a78bfa'
      ctx.lineWidth = 2
      ctx.stroke()
    })

    // Convert to data URL
    resolve(canvas.toDataURL('image/png'))
  })
},

  wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word
      const metrics = ctx.measureText(testLine)
      
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    })
    
    if (currentLine) {
      lines.push(currentLine)
    }

    return lines.slice(0, 6) // Limit to 6 lines
  },

  async generateStudyContent(
  text: string,
  progressCallback?: (progress: number) => void
): Promise<StudyContent> {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured')
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const limitedText = text.substring(0, 30000)
  
  console.log('Sending to AI, text length:', limitedText.length)

  const prompt = `You are an expert educational AI assistant. Analyze the following document and create a comprehensive study guide.

CRITICAL: Base EVERYTHING strictly on the content provided. Do NOT add external information or general knowledge.

CONTENT:
${limitedText}

TASK: Create a detailed study guide with the following sections:

1. KEY POINTS: For each major concept/topic in the document, provide:
   - Title: The main concept/topic name
   - Explanation: Clear explanation of what it is
   - Types: If the concept has types/categories, list them (from the document only)
   - Examples: Specific examples mentioned in the document
   - Importance: Why this concept matters (based on emphasis in the document)

   Extract 12-20 key points covering all major topics.

2. EXAM QUESTIONS: Create 20-30 exam questions covering ALL aspects of the document:
   - Mix of multiple-choice (15-20 questions) and true/false (10-15 questions)
   - Cover every major topic and subtopic from the document
   - Multiple-choice: 4 options each, only one correct
   - True/False: Clear statements that can be verified from the document
   - Each question MUST be directly answerable from the document content
   - Include explanation for correct answer with reference to the content
   - Include the topic/concept being tested

3. DETAILED EXPLANATION: Provide a comprehensive explanation that:
   - Explains each concept thoroughly with context
   - Breaks down complex ideas into simple terms
   - Shows relationships between different concepts
   - Uses examples from the document to illustrate points
   - Reads like a tutorial/lecture that teaches the material
   - Make it comprehensive enough that someone can learn from this alone

4. VISUAL AIDS: Suggest 6-10 specific visual representations:
   - Describe what diagram/chart would help understanding
   - Specify what concept it illustrates
   - Mention key elements to include in the visual

RESPONSE FORMAT: Return ONLY valid JSON with this exact structure (no markdown, no code blocks, no extra text):
{
  "originalContent": "the full original text from the document",
  "keyPoints": [
    {
      "title": "Concept Name",
      "explanation": "Clear explanation",
      "types": ["Type 1", "Type 2"],
      "examples": ["Example 1", "Example 2"],
      "importance": "Why this matters"
    }
  ],
  "examQuestions": [
    {
      "type": "multiple-choice",
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct",
      "topic": "Topic being tested"
    },
    {
      "type": "true-false",
      "question": "Statement to evaluate",
      "options": ["True", "False"],
      "correctAnswer": 0,
      "explanation": "Why this is true/false",
      "topic": "Topic being tested"
    }
  ],
  "detailedExplanation": "Comprehensive explanation with teaching context",
  "visualAids": [
    {
      "description": "What to draw/create",
      "concept": "What concept it explains"
    }
  ]
}

IMPORTANT: Return ONLY the JSON object. No text before or after. No markdown. No explanations.`

  progressCallback?.(30)

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    let responseText = response.text()

    console.log('AI Response received, length:', responseText.length)
    console.log('First 500 chars:', responseText.substring(0, 500))
    console.log('Last 500 chars:', responseText.substring(Math.max(0, responseText.length - 500)))

    progressCallback?.(70)

    // More aggressive cleaning to extract ONLY the JSON
    responseText = responseText.trim()
    
    // Remove markdown code blocks
    responseText = responseText.replace(/```json\s*/gi, '').replace(/```\s*/g, '')
    
    // Remove any text before the first {
    const firstBrace = responseText.indexOf('{')
    if (firstBrace === -1) {
      throw new Error('No JSON object found in response')
    }
    responseText = responseText.substring(firstBrace)
    
    // Find the last closing brace by counting braces
    let braceCount = 0
    let lastValidIndex = -1
    
    for (let i = 0; i < responseText.length; i++) {
      if (responseText[i] === '{') {
        braceCount++
      } else if (responseText[i] === '}') {
        braceCount--
        if (braceCount === 0) {
          lastValidIndex = i
          break
        }
      }
    }
    
    if (lastValidIndex !== -1) {
      responseText = responseText.substring(0, lastValidIndex + 1)
    }

    console.log('Cleaned response length:', responseText.length)
    console.log('Cleaned first 200 chars:', responseText.substring(0, 200))
    console.log('Cleaned last 200 chars:', responseText.substring(Math.max(0, responseText.length - 200)))

    let studyContent: StudyContent

    try {
      studyContent = JSON.parse(responseText)
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError)
      console.error('Failed to parse response. Attempting alternative parsing...')
      
      // Try to fix common JSON issues
      const fixedResponse = responseText
        // Fix unescaped quotes in strings
        .replace(/([^\\])"/g, '$1\\"')
        // Fix trailing commas
        .replace(/,(\s*[}\]])/g, '$1')
        // Remove any control characters
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      
      try {
        studyContent = JSON.parse(fixedResponse)
      } catch (secondError) {
        console.error('Second parse attempt failed:', secondError)
        throw new Error('Failed to parse AI response as JSON. The response may be corrupted.')
      }
    }

    // Validate the response structure
    if (!studyContent.keyPoints || !Array.isArray(studyContent.keyPoints)) {
      throw new Error('Invalid response structure: missing or invalid keyPoints')
    }

    if (!studyContent.examQuestions || !Array.isArray(studyContent.examQuestions)) {
      throw new Error('Invalid response structure: missing or invalid examQuestions')
    }

    if (!studyContent.detailedExplanation || typeof studyContent.detailedExplanation !== 'string') {
      throw new Error('Invalid response structure: missing or invalid detailedExplanation')
    }

    // Ensure we have the original content
    if (!studyContent.originalContent || studyContent.originalContent.length < 100) {
      studyContent.originalContent = text
    }

    // Validate key points structure
    studyContent.keyPoints = studyContent.keyPoints.filter(point => 
      point.title && point.explanation && point.examples && point.importance
    )

    // Validate exam questions structure
    studyContent.examQuestions = studyContent.examQuestions.filter(q =>
      q.question && q.options && Array.isArray(q.options) && 
      typeof q.correctAnswer === 'number' && q.explanation && q.topic
    )

    // Ensure visual aids array exists
    if (!studyContent.visualAids || !Array.isArray(studyContent.visualAids)) {
      studyContent.visualAids = []
    }

    console.log('Successfully parsed study content')
    console.log('Key points:', studyContent.keyPoints.length)
    console.log('Exam questions:', studyContent.examQuestions.length)
    console.log('Visual aids:', studyContent.visualAids.length)

    progressCallback?.(100)

    return studyContent
  } catch (error) {
    console.error('AI generation error:', error)
    
    // Provide a comprehensive fallback
    return {
      originalContent: text,
      keyPoints: [
        {
          title: 'Document Successfully Processed',
          explanation: 'Your document has been extracted and is ready for study. The AI encountered an issue generating the full analysis, but all your content is preserved below.',
          examples: ['All text content from your PDF has been extracted', 'You can read and study the original content'],
          importance: 'The complete original document is available for your review and study.'
        }
      ],
      examQuestions: [
        {
          type: 'multiple-choice' as const,
          question: 'Based on the document, what is the main topic discussed?',
          options: [
            'Review the original content to determine',
            'Check the document sections',
            'Examine the key concepts',
            'Study the material thoroughly'
          ],
          correctAnswer: 0,
          explanation: 'Please review the original content above to understand the main topics.',
          topic: 'General Understanding'
        },
        {
          type: 'true-false' as const,
          question: 'This document contains important educational content for study.',
          options: ['True', 'False'],
          correctAnswer: 0,
          explanation: 'The document has been successfully processed and contains educational content.',
          topic: 'Document Overview'
        }
      ],
      detailedExplanation: `Your document has been successfully processed and contains ${text.length} characters of educational content.

The complete original text from your PDF is preserved and displayed above. While the AI analysis encountered a technical issue, you have full access to all your document content.

To study effectively from this material:

1. **Read Through the Content**: Start by reading the original document content carefully from beginning to end.

2. **Identify Key Concepts**: As you read, note down the main topics, definitions, and important points mentioned.

3. **Create Your Own Notes**: Summarize each section in your own words to reinforce understanding.

4. **Look for Patterns**: Notice how concepts relate to each other and build upon previous information.

5. **Practice Active Recall**: After reading a section, try to recall the main points without looking at the text.

6. **Create Study Questions**: Based on the content, write your own practice questions to test your understanding.

The material is now ready for your review and study. Focus on understanding the concepts presented in the original content.`,
      visualAids: [
        {
          description: 'Create a mind map of the main topics and how they connect to each other',
          concept: 'Document Overview and Structure'
        },
        {
          description: 'Draw diagrams for any processes or systems described in the content',
          concept: 'Visual Representation of Key Processes'
        },
        {
          description: 'Make a timeline if the content discusses sequential events or historical development',
          concept: 'Chronological Organization'
        },
        {
          description: 'Create comparison tables for any concepts that are contrasted in the document',
          concept: 'Comparative Analysis'
        }
      ]
    }
  }
}
}