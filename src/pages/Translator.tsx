import React, { useState } from 'react'
import { HiMicrophone, HiSpeakerWave, HiArrowPath } from 'react-icons/hi2'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getApiKey } from '../services/apiKeyService'

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult
  length: number
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative
  length: number
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  onstart: () => void
  onresult: (event: SpeechRecognitionEvent) => void
  onend: () => void
  onerror: (event: SpeechRecognitionErrorEvent) => void
  start(): void
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

const Translator: React.FC = () => {
  const [inputText, setInputText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [sourceLang, setSourceLang] = useState<'hausa' | 'english'>('hausa')
  const [isListening, setIsListening] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isTranslating, setIsTranslating] = useState(false)

  // Translation function with fallback models
  const translateText = async (text: string, from: string, to: string) => {
    const apiKey = getApiKey()
    if (!apiKey) {
      throw new Error('API key not available')
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    
    // Try models in order of preference
    const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']
    
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        const prompt = `Translate the following text from ${from} to ${to}. Only return the translation, no additional text:\n\n${text}`

        const result = await model.generateContent(prompt)
        const response = await result.response
        return response.text().trim()
      } catch (error: any) {
        console.warn(`Model ${modelName} failed:`, error.message)
        
        // If it's a 503 (service unavailable), try next model
        if (error.message?.includes('503') || error.message?.includes('Service Unavailable')) {
          continue
        }
        
        // If it's a different error (like invalid API key), don't try other models
        if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key')) {
          throw error
        }
        
        // For other errors, continue to next model
        continue
      }
    }
    
    // If all models failed, use mock translation as fallback
    console.warn('All AI models failed, using mock translation')
    return getMockTranslation(text, from, to)
  }

  // Mock translation fallback
  const getMockTranslation = (text: string, from: string, to: string): string => {
    const lowerText = text.toLowerCase()
    
    if (from === 'hausa' && to === 'english') {
      const translations: { [key: string]: string } = {
        'sannu': 'hello',
        'na gode': 'thank you',
        'yaya kake': 'how are you',
        'lafiya lau': 'fine thank you',
        'ban sani ba': 'I don\'t know',
        'ina kwana': 'good morning',
        'ina wuni': 'good afternoon',
        'ina dare': 'good evening',
        'sai anjima': 'see you later',
        'allah ya bada albarka': 'God bless you'
      }
      return translations[lowerText] || `${text} (translation unavailable - API busy)`
    } else if (from === 'english' && to === 'hausa') {
      const translations: { [key: string]: string } = {
        'hello': 'sannu',
        'thank you': 'na gode',
        'how are you': 'yaya kake',
        'fine thank you': 'lafiya lau',
        'i don\'t know': 'ban sani ba',
        'good morning': 'ina kwana',
        'good afternoon': 'ina wuni',
        'good evening': 'ina dare',
        'see you later': 'sai anjima',
        'god bless you': 'allah ya bada albarka'
      }
      return translations[lowerText] || `${text} (translation unavailable - API busy)`
    }
    return text
  }

  // Fallback suggestions when AI is unavailable
  const getFallbackSuggestions = (sourceLang: string): string[] => {
    if (sourceLang === 'hausa') {
      return [
        'Hello, how are you?',
        'Thank you very much',
        'I\'m doing well, thank you',
        'Nice to meet you',
        'God bless you'
      ]
    } else {
      return [
        'Sannu, yaya kake?',
        'Na gode sosai',
        'Lafiya lau',
        'Farinta da haduwa',
        'Allah ya bada albarka'
      ]
    }
  }

  const handleTranslate = async () => {
    if (!inputText.trim()) return

    setIsTranslating(true)
    const targetLang = sourceLang === 'hausa' ? 'english' : 'hausa'
    
    try {
      const translation = await translateText(inputText, sourceLang, targetLang)
      setTranslatedText(translation)

      // Generate reply suggestions using AI with fallback
      const suggestionsPrompt = `Based on the following ${sourceLang} text and its ${targetLang} translation, provide 4 appropriate reply suggestions in ${targetLang}. Return only the suggestions as a numbered list, no additional text.

Text: "${inputText}"
Translation: "${translation}"`

      const apiKey = getApiKey()
      if (apiKey) {
        try {
          const genAI = new GoogleGenerativeAI(apiKey)
          const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
          const result = await model.generateContent(suggestionsPrompt)
          const response = await result.response
          const suggestionsText = response.text().trim()
          
          // Parse the numbered list
          const suggestions = suggestionsText.split('\n')
            .map(line => line.replace(/^\d+\.\s*/, '').trim())
            .filter(line => line.length > 0)
          
          setSuggestions(suggestions.slice(0, 4))
        } catch (error) {
          console.warn('AI suggestions failed, using fallback:', error)
          setSuggestions(getFallbackSuggestions(sourceLang))
        }
      } else {
        setSuggestions(getFallbackSuggestions(sourceLang))
      }
    } catch (error) {
      console.error('Translation error:', error)
      
      // Check if it's a service unavailable error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (errorMessage.includes('503') || errorMessage.includes('Service Unavailable') || errorMessage.includes('high demand')) {
        setTranslatedText(`${getMockTranslation(inputText, sourceLang, targetLang)} (Note: AI service is currently busy - using offline translation)`)
      } else {
        setTranslatedText('Translation failed - please check your API key')
      }
      
      setSuggestions([])
    } finally {
      setIsTranslating(false)
    }
  }

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = sourceLang === 'hausa' ? 'ha' : 'en-US'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      setInputText(transcript)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.start()
  }

  const speakText = (text: string, lang: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech not supported in this browser')
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang === 'hausa' ? 'ha' : 'en-US'

    // Try to find a voice for the language
    const voices = speechSynthesis.getVoices()
    const voice = voices.find(v => v.lang.startsWith(lang === 'hausa' ? 'ha' : 'en'))
    if (voice) {
      utterance.voice = voice
    }

    speechSynthesis.speak(utterance)
  }

  const handleSuggestionClick = (suggestion: string) => {
    const lang = sourceLang === 'hausa' ? 'english' : 'hausa'
    speakText(suggestion, lang)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Language Translator</h1>
        <p className="text-gray-600">Translate between Hausa and English with speech support</p>
      </div>

      <div className="bg-gray-200 rounded-lg shadow-lg p-6">
        <div className="space-y-4">
          {/* Language Selection */}
          <div className="flex items-center justify-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="sourceLang"
                value="hausa"
                checked={sourceLang === 'hausa'}
                onChange={(e) => setSourceLang(e.target.value as 'hausa')}
                className="text-blue-600"
              />
              <span>Hausa</span>
            </label>
            <HiArrowPath className="w-5 h-5 text-gray-400" />
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="sourceLang"
                value="english"
                checked={sourceLang === 'english'}
                onChange={(e) => setSourceLang(e.target.value as 'english')}
                className="text-blue-600"
              />
              <span>English</span>
            </label>
          </div>

          {/* Input Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {sourceLang === 'hausa' ? 'Hausa Text' : 'English Text'}
            </label>
            <div className="flex space-x-2">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Enter ${sourceLang} text or use voice input`}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
              <button
                onClick={startListening}
                disabled={isListening}
                className={`p-3 rounded-lg ${isListening ? 'bg-red-500' : 'bg-blue-500'} text-white hover:opacity-80 transition-opacity`}
                title="Voice input"
              >
                <HiMicrophone className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Translate Button */}
          <div className="text-center">
            <button
              onClick={handleTranslate}
              disabled={!inputText.trim() || isTranslating}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isTranslating ? 'Translating...' : 'Translate'}
            </button>
          </div>

          {/* Translation Output */}
          {translatedText && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Translation ({sourceLang === 'hausa' ? 'English' : 'Hausa'})
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-900">{translatedText}</p>
                <button
                  onClick={() => speakText(translatedText, sourceLang === 'hausa' ? 'english' : 'hausa')}
                  className="mt-2 p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Listen to translation"
                >
                  <HiSpeakerWave className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Reply Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Suggested Replies ({sourceLang === 'hausa' ? 'English' : 'Hausa'})
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="p-3 text-left bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-between"
                  >
                    <span>{suggestion}</span>
                    <HiSpeakerWave className="w-4 h-4 text-blue-600" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Translator