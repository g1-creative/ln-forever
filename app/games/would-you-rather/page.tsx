'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  getRandomQuestion, 
  getQuestionCount,
  getDiscussionPrompt,
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
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<string[]>([]);
  const [discussionPrompt, setDiscussionPrompt] = useState<string>('');
  const [showStats, setShowStats] = useState(false);
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});
  const [isAnimating, setIsAnimating] = useState(false);

  const categories: { value: Category; label: string; icon: string }[] = [
    { value: 'all', label: 'All Categories', icon: '🌟' },
    { value: 'daily', label: 'Daily Life', icon: '🏠' },
    { value: 'travel', label: 'Travel', icon: '✈️' },
    { value: 'work', label: 'Work', icon: '💼' },
    { value: 'romance', label: 'Romance', icon: '💕' },
    { value: 'fun', label: 'Fun / Silly', icon: '🎉' },
    { value: 'deep', label: 'Deep Talk', icon: '💭' },
    { value: 'food', label: 'Food', icon: '🍕' },
    { value: 'lifestyle', label: 'Lifestyle', icon: '✨' },
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
    setDiscussionPrompt('');
    setIsAnimating(true);
    
    // Animate out
    setTimeout(() => {
      const question = getRandomQuestion(
        selectedCategory === 'all' ? undefined : selectedCategory,
        selectedDifficulty === 'all' ? undefined : selectedDifficulty,
        answeredQuestionIds
      );
      
      if (question) {
        setCurrentQuestion(question);
        setIsAnimating(false);
      }
    }, 300);
  };

  const handleSelectOption = (option: 'A' | 'B') => {
    if (selectedOption || !currentQuestion) return; // Already selected
    
    setSelectedOption(option);
    setIsRevealing(true);
    setQuestionsAnswered(prev => prev + 1);
    
    // Track answered question
    if (currentQuestion.id && !answeredQuestionIds.includes(currentQuestion.id)) {
      setAnsweredQuestionIds(prev => [...prev, currentQuestion.id]);
    }
    
    // Update category stats
    setCategoryStats(prev => ({
      ...prev,
      [currentQuestion.category]: (prev[currentQuestion.category] || 0) + 1,
    }));
    
    // Get discussion prompt
    const prompt = getDiscussionPrompt(currentQuestion, option);
    setDiscussionPrompt(prompt);
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }
  };

  const handleNextQuestion = () => {
    handleGetQuestion();
  };

  return (
    <ProtectedRoute>
      <div className="container">
        {!currentQuestion && (
          <>
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
                priority
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
              {questionsAnswered > 0 && (
                <div className="stat-badge clickable" onClick={() => setShowStats(!showStats)}>
                  <span className="stat-label">Stats</span>
                  <span className="stat-value">📊</span>
                </div>
              )}
            </div>

            {showStats && questionsAnswered > 0 && (
              <div className="section wyr-stats-section">
                <h3 className="section-subtitle">Your Session Stats</h3>
                <div className="wyr-stats-grid">
                  <div className="wyr-stat-item">
                    <div className="wyr-stat-value">{questionsAnswered}</div>
                    <div className="wyr-stat-label">Questions Answered</div>
                  </div>
                  <div className="wyr-stat-item">
                    <div className="wyr-stat-value">{answeredQuestionIds.length}</div>
                    <div className="wyr-stat-label">Unique Questions</div>
                  </div>
                  {Object.keys(categoryStats).length > 0 && (
                    <div className="wyr-stat-item full-width">
                      <div className="wyr-stat-label">By Category</div>
                      <div className="wyr-category-stats">
                        {Object.entries(categoryStats).map(([cat, count]) => {
                          const catInfo = categories.find(c => c.value === cat);
                          return (
                            <div key={cat} className="wyr-category-stat">
                              <span className="wyr-category-icon">{catInfo?.icon || '📌'}</span>
                              <span className="wyr-category-name">{catInfo?.label || cat}</span>
                              <span className="wyr-category-count">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="section">
              <div className="section-title">Choose Category</div>
              <div className="category-selector wyr-categories">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    className={`category-btn ${selectedCategory === cat.value ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.value)}
                    title={cat.label}
                  >
                    <span className="category-icon">{cat.icon}</span>
                    <span className="category-text">{cat.label}</span>
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

            <button className="spin-button" onClick={handleGetQuestion} disabled={isAnimating}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              <span>{isAnimating ? 'Loading...' : 'Get Question'}</span>
            </button>
          </>
        )}

        {currentQuestion && (
          <div className="wyr-view-mode">
            <button 
              className="back-to-spin-btn"
              onClick={() => {
                setCurrentQuestion(null);
                setSelectedOption(null);
                setIsRevealing(false);
                setDiscussionPrompt('');
              }}
            >
              ← Back to Filters
            </button>
            <div className={`wyr-card show ${isAnimating ? 'animating' : ''}`}>
              <div className="wyr-question-header">
                <div className="wyr-category-badge-small">
                  {categories.find(c => c.value === currentQuestion.category)?.icon}
                  <span>{categories.find(c => c.value === currentQuestion.category)?.label}</span>
                </div>
                <h2 className="wyr-title">Would You Rather...</h2>
                <div className="wyr-difficulty-badge-small">
                  {currentQuestion.difficulty}
                </div>
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
                      <Image 
                        src={currentQuestion.imageA} 
                        alt="Option A" 
                        width={400}
                        height={300}
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      />
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
                      <Image 
                        src={currentQuestion.imageB} 
                        alt="Option B" 
                        width={400}
                        height={300}
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      />
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
              <div className="wyr-discussion-prompt show">
                <div className="discussion-icon">💬</div>
                <h3>Discuss Your Choice</h3>
                <p className="discussion-text">
                  {discussionPrompt || "Explain why you chose this option. What makes it better for you? Share your thoughts with your partner!"}
                </p>
                <div className="discussion-tips">
                  <div className="tip-item">💡 Think about the reasons behind your choice</div>
                  <div className="tip-item">💡 Share personal experiences or examples</div>
                  <div className="tip-item">💡 Listen to your partner's perspective</div>
                </div>
              </div>
            )}

            <div className="wyr-actions">
              <button 
                className="action-btn" 
                onClick={() => {
                  setSelectedOption(null);
                  setIsRevealing(false);
                  setDiscussionPrompt('');
                }}
                disabled={!selectedOption}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12h18M12 3l9 9-9 9"/>
                </svg>
                <span>Reset</span>
              </button>
              <button className="action-btn primary-action" onClick={handleNextQuestion}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                <span>Next Question</span>
              </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

