'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  getRandomQuestion, 
  getQuestionCount,
  WouldYouRatherQuestion 
} from '@/lib/would-you-rather';

type Category = 'all' | 'daily' | 'travel' | 'work' | 'romance' | 'fun' | 'deep' | 'food' | 'lifestyle';
type Difficulty = 'easy' | 'medium' | 'hard';

export default function WouldYouRatherPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [currentQuestion, setCurrentQuestion] = useState<WouldYouRatherQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  const categories: { value: Category; label: string }[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'daily', label: 'Daily Life' },
    { value: 'travel', label: 'Travel' },
    { value: 'work', label: 'Work' },
    { value: 'romance', label: 'Romance' },
    { value: 'fun', label: 'Fun / Silly' },
    { value: 'deep', label: 'Deep Talk' },
    { value: 'food', label: 'Food' },
    { value: 'lifestyle', label: 'Lifestyle' },
  ];

  useEffect(() => {
    updateQuestionCount();
  }, [selectedCategory, selectedDifficulty]);

  const updateQuestionCount = () => {
    const count = getQuestionCount(
      selectedCategory === 'all' ? undefined : selectedCategory,
      selectedDifficulty === 'all' ? undefined : selectedDifficulty
    );
    setQuestionCount(count);
  };

  const handleGetQuestion = () => {
    setSelectedOption(null);
    setIsRevealing(false);
    
    const question = getRandomQuestion(
      selectedCategory === 'all' ? undefined : selectedCategory,
      selectedDifficulty === 'all' ? undefined : selectedDifficulty
    );
    
    if (question) {
      setCurrentQuestion(question);
    }
  };

  const handleSelectOption = (option: 'A' | 'B') => {
    if (selectedOption) return; // Already selected
    
    setSelectedOption(option);
    setIsRevealing(true);
    setQuestionsAnswered(prev => prev + 1);
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleNextQuestion = () => {
    handleGetQuestion();
  };

  return (
    <ProtectedRoute>
      <div className="container">
        <div className="page-header">
          <Link href="/games" className="back-link">
            ← Back to Games
          </Link>
          <Image 
            src="/images/ln_logo_favicon.png" 
            alt="LN Forever" 
            width={64} 
            height={64}
            className="page-header-logo"
          />
          <h1>Would You Rather</h1>
          <p>Make tough choices and spark interesting conversations</p>
        </div>

        <div className="game-stats-bar">
          <div className="stat-badge">
            <span className="stat-label">Available</span>
            <span className="stat-value">{questionCount}</span>
          </div>
          <div className="stat-badge">
            <span className="stat-label">Answered</span>
            <span className="stat-value">{questionsAnswered}</span>
          </div>
        </div>

        <div className="section">
          <div className="section-title">Choose Category</div>
          <div className="category-selector wyr-categories">
            {categories.map((cat) => (
              <button
                key={cat.value}
                className={`category-btn ${selectedCategory === cat.value ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="section">
          <div className="section-title">Choose Difficulty</div>
          <div className="difficulty-selector">
            <button
              className={`difficulty-btn easy ${selectedDifficulty === 'all' ? 'active' : ''} ${selectedDifficulty === 'easy' ? 'active' : ''}`}
              onClick={() => setSelectedDifficulty(selectedDifficulty === 'easy' ? 'all' : 'easy')}
            >
              <span className="difficulty-label">All</span>
            </button>
            <button
              className={`difficulty-btn easy ${selectedDifficulty === 'easy' ? 'active' : ''}`}
              onClick={() => setSelectedDifficulty('easy')}
            >
              <span className="difficulty-label">Easy</span>
            </button>
            <button
              className={`difficulty-btn medium ${selectedDifficulty === 'medium' ? 'active' : ''}`}
              onClick={() => setSelectedDifficulty('medium')}
            >
              <span className="difficulty-label">Medium</span>
            </button>
            <button
              className={`difficulty-btn hard ${selectedDifficulty === 'hard' ? 'active' : ''}`}
              onClick={() => setSelectedDifficulty('hard')}
            >
              <span className="difficulty-label">Hard</span>
            </button>
          </div>
        </div>

        {!currentQuestion && (
          <button className="spin-button" onClick={handleGetQuestion}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <span>Get Question</span>
          </button>
        )}

        {currentQuestion && (
          <div className="wyr-card show">
            <div className="wyr-question-header">
              <h2 className="wyr-title">Would You Rather...</h2>
            </div>

            <div className="wyr-options">
              <button
                className={`wyr-option ${selectedOption === 'A' ? 'selected' : ''} ${isRevealing && selectedOption === 'A' ? 'revealed' : ''}`}
                onClick={() => handleSelectOption('A')}
                disabled={!!selectedOption}
              >
                <div className="wyr-option-content">
                  {currentQuestion.imageA && (
                    <div className="wyr-image">
                      <img src={currentQuestion.imageA} alt="Option A" />
                    </div>
                  )}
                  <div className="wyr-option-text">
                    <div className="wyr-option-label">Option A</div>
                    <div className="wyr-option-value">{currentQuestion.optionA}</div>
                  </div>
                </div>
                {selectedOption === 'A' && (
                  <div className="wyr-selected-indicator">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                )}
              </button>

              <div className="wyr-divider">
                <span>OR</span>
              </div>

              <button
                className={`wyr-option ${selectedOption === 'B' ? 'selected' : ''} ${isRevealing && selectedOption === 'B' ? 'revealed' : ''}`}
                onClick={() => handleSelectOption('B')}
                disabled={!!selectedOption}
              >
                <div className="wyr-option-content">
                  {currentQuestion.imageB && (
                    <div className="wyr-image">
                      <img src={currentQuestion.imageB} alt="Option B" />
                    </div>
                  )}
                  <div className="wyr-option-text">
                    <div className="wyr-option-label">Option B</div>
                    <div className="wyr-option-value">{currentQuestion.optionB}</div>
                  </div>
                </div>
                {selectedOption === 'B' && (
                  <div className="wyr-selected-indicator">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                )}
              </button>
            </div>

            {selectedOption && (
              <div className="wyr-discussion-prompt">
                <div className="discussion-icon">💬</div>
                <h3>Discuss Your Choice</h3>
                <p>Explain why you chose this option. What makes it better for you? Share your thoughts with your partner!</p>
              </div>
            )}

            <div className="wyr-actions">
              <button className="action-btn primary-action" onClick={handleNextQuestion}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                <span>Next Question</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

