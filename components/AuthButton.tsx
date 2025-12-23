'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthButton() {
  const { user, signIn, signUp, signOut, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (isSignUp) {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
      setShowForm(false);
      setEmail('');
      setPassword('');
      setName('');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  if (loading) {
    return <div className="auth-loading">Loading...</div>;
  }

  if (user) {
    return (
      <div className="auth-section">
        <div className="auth-user">
          <span>👤 {user.email}</span>
          <button className="auth-btn" onClick={signOut}>
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="auth-section">
        <button className="auth-btn" onClick={() => setShowForm(true)}>
          Sign In / Sign Up
        </button>
      </div>
    );
  }

  return (
    <div className="auth-section">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h3>{isSignUp ? 'Sign Up' : 'Sign In'}</h3>
        
        {isSignUp && (
          <input
            type="text"
            placeholder="Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        {error && <div className="auth-error">{error}</div>}
        
        <div className="auth-actions">
          <button type="submit" className="auth-btn primary">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
          <button
            type="button"
            className="auth-btn secondary"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
          <button
            type="button"
            className="auth-btn secondary"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
