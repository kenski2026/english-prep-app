'use client'

import { useState, useEffect } from 'react'

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

interface DictationProps {
  vocabulary: VocabWord[]
}

export default function Dictation({ vocabulary }: DictationProps) {
  const [currentWord, setCurrentWord] = useState<VocabWord | null>(null)
  const [userInput, setUserInput] = useState('')
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [showHint, setShowHint] = useState(false)
  const [category, setCategory] = useState('all')

  const categorySet = new Set(vocabulary.map(v => v.category))
  const categories = ['all', ...Array.from(categorySet)]

  const filteredVocab = category === 'all' 
    ? vocabulary 
    : vocabulary.filter(v => v.category === category)

  useEffect(() => {
    nextWord()
  }, [category])

  const nextWord = () => {
    const random = filteredVocab[Math.floor(Math.random() * filteredVocab.length)]
    setCurrentWord(random)
    setUserInput('')
    setResult(null)
    setShowHint(false)
  }

  const playAudio = () => {
    if (currentWord && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word)
      utterance.lang = 'en-US'
      utterance.rate = 0.7
      window.speechSynthesis.speak(utterance)
    }
  }

  const checkAnswer = () => {
    if (!currentWord) return
    
    setScore(prev => ({ ...prev, total: prev.total + 1 }))
    
    const isCorrect = userInput.toLowerCase().trim() === currentWord.word.toLowerCase()
    setResult(isCorrect ? 'correct' : 'wrong')
    
    if (isCorrect) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }))
    }
  }

  const getHint = () => {
    if (!currentWord) return ''
    const word = currentWord.word
    const revealCount = Math.ceil(word.length * 0.5)
    return word.slice(0, revealCount) + '_'.repeat(word.length - revealCount)
  }

  if (!currentWord) return <div className="text-white">Loading...</div>

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold text-blue-400 mb-4">👂 Dictation Practice</h2>
      
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded-full text-sm ${
              category === cat 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            {cat === 'all' ? '全部 All' : cat}
          </button>
        ))}
      </div>

      {/* Score */}
      <div className="flex justify-between text-gray-400 text-sm mb-6">
        <span>正确: {score.correct}</span>
        <span>总数: {score.total}</span>
        <span>准确率: {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%</span>
      </div>

      {/* Dictation Card */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700">
        <div className="text-center mb-6">
          <p className="text-gray-400 text-sm mb-2">听写这个单词:</p>
          <button 
            onClick={playAudio}
            className="px-6 py-3 bg-blue-500 rounded-full text-white text-lg"
          >
            🔊 播放发音
          </button>
        </div>

        {/* Hint */}
        <div className="text-center mb-4">
          {showHint ? (
            <p className="text-yellow-400 text-xl font-mono">{getHint()}</p>
          ) : (
            <button 
              onClick={() => setShowHint(true)}
              className="text-gray-500 text-sm hover:text-gray-400"
            >
              💡 显示提示
            </button>
          )}
        </div>

        {/* Input */}
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
          placeholder="输入单词..."
          className={`w-full p-3 rounded-lg text-center text-xl bg-gray-700 text-white border-2 ${
            result === 'correct' ? 'border-green-500' : 
            result === 'wrong' ? 'border-red-500' : 'border-gray-600'
          }`}
          disabled={result !== null}
        />

        {/* Result */}
        {result && (
          <div className={`mt-4 p-3 rounded-lg text-center ${
            result === 'correct' ? 'bg-green-900' : 'bg-red-900'
          }`}>
            {result === 'correct' ? (
              <p className="text-green-400">✓ 正确!</p>
            ) : (
              <div>
                <p className="text-red-400">✗ 错误</p>
                <p className="text-white">正确答案是: <span className="font-bold">{currentWord.word}</span></p>
                <p className="text-gray-300 text-sm">{currentWord.meaning}</p>
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 mt-4">
          {result ? (
            <button 
              onClick={nextWord}
              className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-bold"
            >
              下一题 →
            </button>
          ) : (
            <button 
              onClick={checkAnswer}
              className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold"
            >
              提交
            </button>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-gray-300 font-bold mb-2">使用方法:</h3>
        <ol className="text-gray-400 text-sm space-y-1">
          <li>1. 点击播放按钮听单词</li>
          <li>2. 输入你听到的单词</li>
          <li>3. 点击提交检查答案</li>
          <li>4. 查看结果并继续下一题</li>
        </ol>
      </div>
    </div>
  )
}
