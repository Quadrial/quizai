import { GoogleGenerativeAI } from '@google/generative-ai'

export async function testGeminiAPI(): Promise<{ success: boolean; error?: string; models?: string[] }> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  
  if (!apiKey) {
    return { success: false, error: 'No API key provided' }
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    
    // Try a simple test with gemini-2.5-flash
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    
    const result = await model.generateContent('Say "Hello, API test successful!"')
    const response = await result.response
    const text = response.text()
    
    console.log('API Test Response:', text)
    
    return { success: true }
  } catch (error: any) {
    console.error('API Test Error:', error)
    return { 
      success: false, 
      error: error.message || 'Unknown error'
    }
  }
}