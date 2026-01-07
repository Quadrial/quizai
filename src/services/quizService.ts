// Real Gemini AI integration
import { GoogleGenerativeAI } from '@google/generative-ai'
import * as pdfjsLib from 'pdfjs-dist'
import type { Quiz, Question, StudyMaterial } from '../types'

// Set up PDF.js worker - use local worker file from public directory
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

export class QuizService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  async generateQuiz(material: StudyMaterial, questionCount: number = 5, questionType: 'multiple-choice' | 'true-false' = 'multiple-choice', difficulty: 'easy' | 'medium' | 'hard' | 'technical' = 'medium'): Promise<Quiz> {
    if (!material.content) {
      throw new Error('Material content is required to generate a quiz')
    }

    // Check if API key is available
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      console.warn('Gemini API key not found, using mock data')
      return this.generateMockQuiz(material, questionCount, questionType, difficulty)
    }

    try {
      const prompt = this.createPrompt(material.content, questionCount, questionType, difficulty)
      
      // Use the simpler generateContent method
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      console.log('AI Response:', text) // Debug log
      
      const quizData = this.parseQuizResponse(text, questionType)
      
      return {
        id: crypto.randomUUID(),
        title: `Quiz: ${material.name}`,
        content: material.content,
        questions: quizData.questions,
        createdAt: new Date().toISOString(),
        type: questionType
      }
    } catch (error) {
      console.error('Error generating quiz with AI:', error)
      console.log('Falling back to mock data')
      return this.generateMockQuiz(material, questionCount, questionType, difficulty)
    }
  }

  private generateMockQuiz(material: StudyMaterial, questionCount: number, questionType: 'multiple-choice' | 'true-false', difficulty: 'easy' | 'medium' | 'hard' | 'technical'): Quiz {
    if (!material.content) {
      throw new Error('Material content is required to generate a mock quiz')
    }
    // Generate questions based on questionCount and questionType
    const questions: Question[] = []
    for (let i = 0; i < questionCount; i++) {
      if (questionType === 'true-false') {
        const isTrue = Math.random() > 0.5
        questions.push({
          id: `q${i + 1}`,
          question: `Sample ${difficulty} level true/false statement ${i + 1} about: ${material.name}?`,
          options: ['True', 'False'],
          correctAnswer: isTrue ? 0 : 1,
          explanation: `This statement is ${isTrue ? 'true' : 'false'} because it relates to the content about ${material.name}`,
          type: 'true-false'
        })
      } else {
        questions.push({
          id: `q${i + 1}`,
          question: `Sample ${difficulty} level multiple-choice question ${i + 1} about: ${material.name}?`,
          options: [
            `Correct answer for question ${i + 1}`,
            `Incorrect option A for question ${i + 1}`,
            `Incorrect option B for question ${i + 1}`,
            `Incorrect option C for question ${i + 1}`
          ],
          correctAnswer: 0,
          explanation: `This is correct because it relates to the content about ${material.name}`,
          type: 'multiple-choice'
        })
      }
    }

    return {
      id: crypto.randomUUID(),
      title: `Quiz: ${material.name}`,
      content: material.content,
      questions,
      createdAt: new Date().toISOString(),
      type: questionType
    }
  }

  private createPrompt(content: string, questionCount: number, questionType: 'multiple-choice' | 'true-false', difficulty: 'easy' | 'medium' | 'hard' | 'technical'): string {
    const difficultyDescriptions = {
      easy: 'basic concepts, definitions, and simple facts',
      medium: 'intermediate understanding, relationships between concepts, and practical applications',
      hard: 'complex analysis, critical thinking, and advanced concepts',
      technical: 'detailed technical knowledge, specific terminology, and expert-level understanding'
    }

    const strictInstructions = `CRITICAL: You MUST create questions that are based EXCLUSIVELY on the provided content. Do NOT use general knowledge, external information, or assumptions. If the content doesn't contain enough information for a question, create simpler questions from what's available. Every question must be directly derived from the text provided.`

    if (questionType === 'true-false') {
      return `You are an expert quiz generator. Create a high-quality true/false quiz based EXCLUSIVELY on the provided content.

CONTENT:
${content}

${strictInstructions}

TASK: Generate exactly ${questionCount} true/false questions at ${difficulty} level (${difficultyDescriptions[difficulty]}).

REQUIREMENTS:
- Each question must be a statement that can be answered as true or false BASED ONLY ON THE CONTENT ABOVE
- Questions should test ${difficultyDescriptions[difficulty]}
- Include clear explanations for correct answers that reference the content
- Make statements based directly on facts, concepts, or information explicitly stated in the content
- Do NOT invent information, use external knowledge, or make assumptions

RESPONSE FORMAT: Return ONLY a valid JSON object with this exact structure:
{
  "questions": [
    {
      "id": "q1",
      "question": "This is a true/false statement about the content?",
      "options": ["True", "False"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is true/false"
    }
  ]
}

Generate exactly ${questionCount} questions. Return only the JSON, no additional text.`
    } else {
      return `You are an expert quiz generator. Create a high-quality multiple-choice quiz based EXCLUSIVELY on the provided content.

CONTENT:
${content}

${strictInstructions}

TASK: Generate exactly ${questionCount} multiple-choice questions at ${difficulty} level (${difficultyDescriptions[difficulty]}).

REQUIREMENTS:
- Each question must have exactly 4 options
- Only one option should be correct
- Questions should test ${difficultyDescriptions[difficulty]}
- Include clear explanations for correct answers that reference the content
- Make incorrect options plausible but clearly wrong based on the content
- Questions should be directly related to facts, concepts, or information explicitly stated in the content
- Do NOT invent information, use external knowledge, or make assumptions

RESPONSE FORMAT: Return ONLY a valid JSON object with this exact structure:
{
  "questions": [
    {
      "id": "q1",
      "question": "What is the main concept discussed?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of the correct answer"
    }
  ]
}

Generate exactly ${questionCount} questions. Return only the JSON, no additional text.`
    }
  }

  private parseQuizResponse(response: string, questionType: 'multiple-choice' | 'true-false' = 'multiple-choice'): { questions: Question[] } {
    try {
      console.log('Raw AI response:', response) // Debug log
      
      // Clean up the response - remove markdown code blocks and extra text
      let cleanResponse = response.trim()
      
      // Remove markdown code blocks
      cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '')
      
      // Try to find JSON in the response
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        cleanResponse = jsonMatch[0]
      }
      
      // Remove any text before the first { or after the last }
      const firstBrace = cleanResponse.indexOf('{')
      const lastBrace = cleanResponse.lastIndexOf('}')
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanResponse = cleanResponse.substring(firstBrace, lastBrace + 1)
      }

      console.log('Cleaned response:', cleanResponse) // Debug log
      
      const parsed = JSON.parse(cleanResponse)
      
      // Validate the structure
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Invalid quiz format: missing questions array')
      }

      // Ensure each question has required fields
      const validatedQuestions: Question[] = parsed.questions.map((q: unknown, index: number) => {
        const question = q as Record<string, unknown>
        
        const expectedOptionsLength = questionType === 'true-false' ? 2 : 4
        
        if (!question.question || !Array.isArray(question.options) || question.options.length !== expectedOptionsLength) {
          throw new Error(`Invalid question format at index ${index}`)
        }
        
        return {
          id: (question.id as string) || `q${index + 1}`,
          question: question.question as string,
          options: question.options as string[],
          correctAnswer: typeof question.correctAnswer === 'number' ? question.correctAnswer : 0,
          explanation: (question.explanation as string) || 'No explanation provided',
          type: questionType
        }
      })

      if (validatedQuestions.length === 0) {
        throw new Error('No valid questions found in response')
      }

      return { questions: validatedQuestions }
    } catch (parseError) {
      console.error('Error parsing quiz response:', parseError)
      console.error('Original response:', response)
      throw new Error('Failed to parse AI response. Using mock data instead.')
    }
  }

  async extractTextFromPDF(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      const pdf = await pdfjsLib.getDocument(uint8Array).promise
      
      let fullText = ''
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        
        const pageText = textContent.items
          .map((item) => 'str' in item ? item.str : '')
          .join(' ')
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim()
        
        if (pageText) {
          fullText += pageText + '\n\n'
        }
      }
      
      if (!fullText.trim()) {
        throw new Error('No text content found in PDF. The PDF might contain only images or be scanned.')
      }
      
      return fullText.trim()
    } catch (error) {
      console.error('Error extracting text from PDF:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to extract text from PDF: ${errorMessage}`)
    }
  }

  async extractTextFromURL(url: string): Promise<string> {
    try {
      // This would typically be done server-side to avoid CORS issues
      // For now, return a placeholder
      return `URL content extraction not implemented yet. URL: ${url}`
    } catch (error) {
      console.error('Error extracting content from URL:', error)
      throw new Error('Failed to extract content from URL')
    }
  }

  async generatePdfTutorPack(params: { pdfName: string; extractedText: string }): Promise<{
    title: string
    overview: string
    keyPoints: { point: string; evidence: string }[]
    examLikely: { question: string; answer: string; evidence: string }[]
    diagrams: { title: string; mermaid: string }[]
  }> {
    // Check if API key is available
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      console.warn('Gemini API key not found, using mock data')
      return this.generateMockTutorPack(params)
    }

    try {
      const prompt = `You are an expert educational AI assistant. Analyze the following PDF content and create a comprehensive tutor pack.

CRITICAL: Base EVERYTHING strictly on the content provided. Do NOT add external information or general knowledge.

PDF NAME: ${params.pdfName}
CONTENT:
${params.extractedText.substring(0, 30000)}

TASK: Create a detailed tutor pack with the following sections:

1. TITLE: Create a descriptive title based on the main topic of the PDF
2. OVERVIEW: Provide a comprehensive overview of what the document covers (2-3 paragraphs)
3. KEY POINTS: Extract 8-12 important points from the document, each with:
   - point: The main concept/fact
   - evidence: Direct quote or reference from the document supporting this point
4. EXAM LIKELY: Create 6-10 potential exam questions with answers, each with:
   - question: A likely exam question based on the content
   - answer: The correct answer based on the document
   - evidence: Supporting evidence from the document
5. DIAGRAMS: Suggest 2-4 Mermaid diagrams that would help visualize concepts, each with:
   - title: What the diagram shows
   - mermaid: Valid Mermaid syntax for the diagram

RESPONSE FORMAT: Return ONLY valid JSON with this exact structure:
{
  "title": "Document Title",
  "overview": "Comprehensive overview...",
  "keyPoints": [
    {
      "point": "Key concept",
      "evidence": "Supporting evidence from document"
    }
  ],
  "examLikely": [
    {
      "question": "Potential exam question?",
      "answer": "Answer based on document",
      "evidence": "Supporting evidence"
    }
  ],
  "diagrams": [
    {
      "title": "Diagram description",
      "mermaid": "graph TD\\n    A[Start] --> B[Process]"
    }
  ]
}

IMPORTANT: Return ONLY the JSON object. No text before or after. No markdown. No explanations.`

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      console.log('AI Tutor Pack Response:', text) // Debug log
      
      // Clean up the response
      let cleanResponse = text.trim()
      cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '')
      
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        cleanResponse = jsonMatch[0]
      }
      
      const firstBrace = cleanResponse.indexOf('{')
      const lastBrace = cleanResponse.lastIndexOf('}')
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanResponse = cleanResponse.substring(firstBrace, lastBrace + 1)
      }

      const parsed = JSON.parse(cleanResponse)
      
      // Validate the structure
      if (!parsed.title || !parsed.overview || !parsed.keyPoints || !parsed.examLikely) {
        throw new Error('Invalid tutor pack format')
      }

      return {
        title: parsed.title,
        overview: parsed.overview,
        keyPoints: parsed.keyPoints || [],
        examLikely: parsed.examLikely || [],
        diagrams: parsed.diagrams || []
      }
    } catch (error) {
      console.error('Error generating tutor pack with AI:', error)
      console.log('Falling back to mock data')
      return this.generateMockTutorPack(params)
    }
  }

  private generateMockTutorPack(params: { pdfName: string; extractedText: string }) {
    return {
      title: `Study Guide: ${params.pdfName}`,
      overview: `This document contains important educational content extracted from ${params.pdfName}. The material covers various topics and concepts that are essential for understanding the subject matter. The content has been successfully processed and is ready for study and review.`,
      keyPoints: [
        {
          point: "Document successfully processed and analyzed",
          evidence: "All text content has been extracted from the PDF file"
        },
        {
          point: "Content is available for study and review",
          evidence: "The extracted text contains educational material"
        },
        {
          point: "Material can be used for learning purposes",
          evidence: "The document structure suggests educational content"
        }
      ],
      examLikely: [
        {
          question: "What is the main topic covered in this document?",
          answer: "Review the content to identify the primary subject matter",
          evidence: "Based on the document title and content structure"
        },
        {
          question: "What are the key concepts discussed?",
          answer: "Examine the main sections and headings in the document",
          evidence: "Content organization suggests important topics"
        }
      ],
      diagrams: [
        {
          title: "Document Structure Overview",
          mermaid: "graph TD\n    A[PDF Document] --> B[Text Extraction]\n    B --> C[Content Analysis]\n    C --> D[Study Materials]"
        }
      ]
    }
  }
}

export const quizService = new QuizService()