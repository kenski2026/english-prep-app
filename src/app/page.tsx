'use client'

import { useState } from 'react'
import Flashcards from '../components/Flashcards'
import Dictation from '../components/Dictation'

interface Question {
  base: string
  baseEn: string
  variations: {
    type: string
    text: string
    textEn: string
    keyPoints: string[]
    phonetic: string
  }[]
}

interface Category {
  id: string
  name: string
  nameEn: string
  questions: Question[]
}

interface VocabWord {
  id: string
  word: string
  phonetic: string
  meaning: string
  meaningEn: string
  example: string
  exampleZh: string
  category: string
}

interface PhoneticTips {
  commonChallenges: Record<string, string[]>
  practicePhrases: string[]
}

type Tab = 'conversation' | 'flashcards' | 'dictation'

// Static data - loaded at build time
import questionsData from '../data/questions.json'
import vocabularyData from '../data/vocabulary.json'

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('conversation')
  const [categories] = useState<Category[]>(questionsData?.categories || [])
  const [vocabulary] = useState<VocabWord[]>(vocabularyData?.vocabulary || [])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [currentVariation, setCurrentVariation] = useState<number>(0)
  const [phoneticTips] = useState<PhoneticTips | null>(questionsData?.phoneticTips || null)
  const [showPhoneticTab, setShowPhoneticTab] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState('')

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.8
      utterance.onstart = () => setPlaying(true)
      utterance.onend = () => setPlaying(false)
      utterance.onerror = () => setPlaying(false)
      window.speechSynthesis.speak(utterance)
    }
  }

  const playFullAnswer = (question: Question, variationIndex: number) => {
    const v = question.variations[variationIndex]
    const fullText = question.baseEn + '. ' + v.textEn
    playAudio(fullText)
  }

  const startRecording = () => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognitionAPI) {
      alert('Speech recognition not supported. Try Chrome on desktop.')
      return
    }
    
    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'en-US'
    recognition.interimResults = true
    recognition.continuous = false
    
    recognition.onstart = () => {
      setRecording(true)
      setTranscript('')
    }
    
    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''
      
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        } else {
          interimTranscript += event.results[i][0].transcript
        }
      }
      
      if (finalTranscript) {
        setTranscript(finalTranscript)
        alert('You said: ' + finalTranscript)
      } else {
        setTranscript(interimTranscript)
      }
    }
    
    recognition.onerror = (event: any) => {
      setRecording(false)
      console.error('Speech recognition error:', event.error)
      alert('Error: ' + event.error + '. Try using Chrome browser.')
    }
    
    recognition.onend = () => {
      setRecording(false)
      if (transcript) {
        alert('You said: ' + transcript)
      }
    }
    
    try {
      recognition.start()
    } catch (e) {
      console.error('Failed to start recognition:', e)
      alert('Failed to start recording. Please try again.')
    }
  }

  const stopRecording = () => {
    setRecording(false)
    setTranscript('')
  }

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId)
    setSelectedQuestion(null)
  }

  const handleQuestionClick = (q: Question) => {
    setSelectedQuestion(q)
    setCurrentVariation(0)
  }

  const handleBack = () => {
    if (selectedQuestion) {
      setSelectedQuestion(null)
    } else if (selectedCategory) {
      setSelectedCategory('')
    }
  }

  // Get current category questions
  const currentCategoryQuestions = selectedCategory 
    ? categories.find(c => c.id === selectedCategory)?.questions || []
    : []

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <h1 className="text-2xl font-bold text-center text-orange-400">
          📚 English Prep App 英语学习
        </h1>
      </header>

      {/* Tab Navigation */}
      <nav className="flex justify-center gap-2 p-4 bg-gray-800">
        <button
          onClick={() => setActiveTab('conversation')}
          className={'px-4 py-2 rounded-lg font-bold ' + (activeTab === 'conversation' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600')}
        >
          💬 对话
        </button>
        <button
          onClick={() => setActiveTab('flashcards')}
          className={'px-4 py-2 rounded-lg font-bold ' + (activeTab === 'flashcards' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600')}
        >
          📇 单词卡
        </button>
        <button
          onClick={() => setActiveTab('dictation')}
          className={'px-4 py-2 rounded-lg font-bold ' + (activeTab === 'dictation' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600')}
        >
          👂 听写
        </button>
      </nav>

      {/* Tab Content */}
      <main className="p-4">
        {activeTab === 'conversation' && (
          <div>
            {/* Back Button */}
            {(selectedCategory || selectedQuestion) && (
              <button
                onClick={handleBack}
                className="text-gray-400 hover:text-white mb-4"
              >
                ← 返回
              </button>
            )}

            {/* Show categories or questions */}
            {!selectedCategory ? (
              /* Category List */
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white mb-4">选择类别 / Select Category</h2>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500 transition-colors text-left"
                    >
                      <span className="text-white font-bold">{cat.name}</span>
                      <span className="text-gray-400 text-sm block">{cat.nameEn}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : !selectedQuestion ? (
              /* Question List */
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white mb-4">
                  {categories.find(c => c.id === selectedCategory)?.name}
                </h2>
                {currentCategoryQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuestionClick(q)}
                    className="w-full p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-orange-500 transition-colors text-left"
                  >
                    <span className="text-white font-bold text-lg">{q.base}</span>
                    <span className="text-gray-400 text-sm block">{q.baseEn}</span>
                  </button>
                ))}
              </div>
            ) : (
              /* Question Detail */
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-xl p-6 border border-orange-500">
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-white mb-2">{selectedQuestion.base}</h3>
                    <h4 className="text-xl text-orange-400">{selectedQuestion.baseEn}</h4>
                  </div>

                  {/* Variation Tabs */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {selectedQuestion.variations.map((v, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentVariation(idx)}
                        className={'px-3 py-1 rounded-full text-sm ' + (currentVariation === idx ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300')}
                      >
                        {v.type}
                      </button>
                    ))}
                  </div>

                  {/* Answer */}
                  <div className="bg-gray-900 rounded-lg p-4 mb-4">
                    <p className="text-lg text-white mb-1">{selectedQuestion.variations[currentVariation].text}</p>
                    <p className="text-gray-400">{selectedQuestion.variations[currentVariation].textEn}</p>
                    <p className="text-gray-500 text-sm mt-2">
                      🔊 {selectedQuestion.variations[currentVariation].phonetic}
                    </p>
                  </div>

                  {/* Key Points */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedQuestion.variations[currentVariation].keyPoints.map((point, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-900 text-blue-300 rounded text-sm">
                        {point}
                      </span>
                    ))}
                  </div>

                  {/* Audio Controls */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => playAudio(selectedQuestion.baseEn)}
                      disabled={playing}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {playing ? '🔊...' : '❓ 问题'}
                    </button>
                    
                    <button
                      onClick={() => playFullAnswer(selectedQuestion, currentVariation)}
                      disabled={playing}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {playing ? '🔊...' : '✅ 答案'}
                    </button>
                    
                    <button
                      onClick={recording ? stopRecording : startRecording}
                      className={'flex items-center gap-2 px-4 py-2 rounded-lg ' + (recording ? 'bg-red-500 text-white animate-pulse' : 'bg-green-600 text-white hover:bg-green-700')}
                    >
                      {recording ? '⏹ 录音中...' : '🎤 点击说话'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Phonetic Tips Toggle */}
            {phoneticTips && (
              <button
                onClick={() => setShowPhoneticTab(!showPhoneticTab)}
                className="fixed bottom-4 right-4 bg-orange-600 text-white px-4 py-2 rounded-full shadow-lg"
              >
                {showPhoneticTab ? '隐藏音标' : '📖 音标提示'}
              </button>
            )}

            {/* Phonetic Tips Panel */}
            {showPhoneticTab && phoneticTips && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-orange-400">常见音标挑战</h3>
                    <button onClick={() => setShowPhoneticTab(false)} className="text-gray-400">✕</button>
                  </div>
                  
                  {Object.entries(phoneticTips.commonChallenges).map(([sound, words]) => (
                    <div key={sound} className="mb-4">
                      <h4 className="text-white font-bold">{sound}</h4>
                      <p className="text-gray-400 text-sm">{words.join(', ')}</p>
                    </div>
                  ))}
                  
                  <h3 className="text-xl font-bold text-orange-400 mt-6 mb-4">练习短语</h3>
                  <ul className="space-y-2">
                    {phoneticTips.practicePhrases.map((phrase, idx) => (
                      <li key={idx} className="text-gray-300 text-sm">{phrase}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'flashcards' && (
          <Flashcards vocabulary={vocabulary} />
        )}
        
        {activeTab === 'dictation' && (
          <Dictation vocabulary={vocabulary} />
        )}
      </main>
    </div>
  )
}
