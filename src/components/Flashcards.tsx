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

interface FlashcardProps {
  vocabulary: VocabWord[]
}

export default function Flashcards({ vocabulary }: FlashcardProps) {
  const [cards, setCards] = useState<VocabWord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [category, setCategory] = useState('all')

  useEffect(() => {
    if (category === 'all') {
      setCards(vocabulary)
    } else {
      setCards(vocabulary.filter(v => v.category === category))
    }
    setCurrentIndex(0)
    setFlipped(false)
  }, [category, vocabulary])

  const categorySet = new Set(vocabulary.map(v => v.category))
  const categories = ['all', ...Array.from(categorySet)]

  const playAudio = (word: string) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(word)
        utterance.lang = 'en-US'
        utterance.rate = 0.8
        window.speechSynthesis.speak(utterance)
      } else {
        alert('Browser does not support speech!')
      }
    } catch (e) {
      console.error('Audio error:', e)
    }
  }

  const handleNext = () => {
    setFlipped(false)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length)
    }, 150)
  }

  const handlePrev = () => {
    setFlipped(false)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length)
    }, 150)
  }

  if (cards.length === 0) {
    return <div className="text-white text-center p-8">Loading...</div>
  }

  const currentCard = cards[currentIndex]

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold text-orange-400 mb-4">📚 Vocabulary Flashcards</h2>
      
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded-full text-sm ${
              category === cat 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            {cat === 'all' ? '全部 All' : cat}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="flex justify-between text-gray-400 text-sm mb-4">
        <span>剩余: {cards.length}</span>
        <span>进度: {currentIndex + 1} / {cards.length}</span>
      </div>

      {/* Card - Simple flip without 3D transforms */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-700 px-4 py-2 text-center">
          <span className="text-orange-400 text-sm">{currentCard.category}</span>
        </div>
        
        {/* Content - show different based on flip state */}
        <div className="p-6 min-h-[200px]">
          {!flipped ? (
            // Front - Chinese meaning + English word
            <div className="text-center">
              <p className="text-gray-400 text-xl mb-4">{currentCard.meaning}</p>
              <h3 className="text-4xl font-bold text-white mb-2">{currentCard.word}</h3>
              <p className="text-gray-500 text-lg">{currentCard.phonetic}</p>
              <button 
                onClick={() => playAudio(currentCard.word)}
                className="mt-4 px-6 py-2 bg-orange-500 rounded-full text-white"
              >
                🔊 播放发音
              </button>
            </div>
          ) : (
            // Back - Full details with example
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">{currentCard.word}</h3>
              <p className="text-gray-400 mb-4">{currentCard.phonetic}</p>
              <p className="text-orange-300 text-lg mb-2">{currentCard.meaning}</p>
              <p className="text-gray-400 text-sm mb-4">{currentCard.meaningEn}</p>
              <div className="border-t border-gray-700 pt-4 mt-4">
                <p className="text-orange-300 italic">"{currentCard.example}"</p>
                <p className="text-gray-400 text-sm">{currentCard.exampleZh}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Flip hint */}
        <div className="bg-gray-700 px-4 py-2 text-center">
          <button 
            onClick={() => setFlipped(!flipped)}
            className="text-gray-400 text-sm hover:text-white"
          >
            {flipped ? '← 看前面' : '点击看详情 →'}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 mt-6">
        <button 
          onClick={handlePrev}
          className="px-6 py-2 bg-gray-700 text-white rounded-lg"
        >
          ◀ 上一张
        </button>
        <button 
          onClick={() => { setFlipped(!flipped); }}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg"
        >
          {flipped ? '↩ 翻转' : '🔄 翻转'}
        </button>
        <button 
          onClick={handleNext}
          className="px-6 py-2 bg-gray-700 text-white rounded-lg"
        >
          下一张 ▶
        </button>
      </div>
    </div>
  )
}
