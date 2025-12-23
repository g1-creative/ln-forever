'use client';

import { useEffect, useRef, useState } from 'react';

interface TimerProps {
  totalTime?: number; // in seconds
  onComplete?: (durationSeconds: number) => void;
  onStop?: (durationSeconds: number) => void;
}

export default function Timer({ totalTime = 150, onComplete, onStop }: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(totalTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<SVGCircleElement>(null);

  const circumference = 2 * Math.PI * 45; // radius is 45

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateProgress = (remaining: number) => {
    if (progressRef.current) {
      const progress = (totalTime - remaining) / totalTime;
      const offset = circumference - (progress * circumference);
      progressRef.current.style.strokeDashoffset = offset.toString();
      
      // Change color when less than 30 seconds remain
      if (remaining <= 30) {
        progressRef.current.classList.add('warning');
      } else {
        progressRef.current.classList.remove('warning');
      }
    }
  };

  useEffect(() => {
    updateProgress(timeRemaining);
  }, [timeRemaining]);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          setElapsedTime((elapsed) => elapsed + 1);
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            const duration = totalTime; // Full timer completed
            if (onComplete) {
              onComplete(duration);
            }
            // Vibrate if supported
            if (navigator.vibrate) {
              navigator.vibrate([200, 100, 200]);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining, totalTime, onComplete]);

  const startTimer = () => {
    setIsComplete(false);
    setTimeRemaining(totalTime);
    setElapsedTime(0);
    setStartTime(Date.now());
    setIsRunning(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
    if (onStop && elapsedTime > 0) {
      onStop(elapsedTime);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsComplete(false);
    setTimeRemaining(totalTime);
  };

  return (
    <div className="timer-section">
      <div className="timer-container">
        <div className="timer-circle">
          <svg className="timer-svg" viewBox="0 0 100 100">
            <circle className="timer-bg" cx="50" cy="50" r="45"></circle>
            <circle
              ref={progressRef}
              className="timer-progress"
              cx="50"
              cy="50"
              r="45"
            ></circle>
          </svg>
          <div className="timer-text">{formatTime(timeRemaining)}</div>
        </div>
        <div className="timer-controls">
          {!isRunning && timeRemaining === totalTime && (
            <button className="timer-btn" onClick={startTimer}>
              ⏱️ Start Timer
            </button>
          )}
          {isRunning && (
            <button className="timer-btn" onClick={stopTimer}>
              ⏸️ Stop
            </button>
          )}
          {!isRunning && timeRemaining < totalTime && !isComplete && (
            <>
              <button className="timer-btn" onClick={startTimer}>
                ▶️ Resume
              </button>
              <button className="timer-btn" onClick={resetTimer}>
                🔄 Reset
              </button>
            </>
          )}
        </div>
        {isComplete && (
          <div className="timer-complete">
            ⏰ Time&apos;s up! How did it go? 😊
          </div>
        )}
      </div>
    </div>
  );
}
