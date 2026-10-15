import { useState } from 'react';
import './App.css';
import api from './api';
import Dashboard from './Dashboard';

function App() {
  const [page, setPage] = useState('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem('auth_token')
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    resetMessages();

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/register', {
        name,
        email,
        password,
        password_confirmation: confirmPassword,
      });

      setSuccess('Registration successful! Please sign in.');
      setPage('login');
      setName('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      const data = err.response?.data;

      setError(
        data?.message ||
        Object.values(data?.errors || {}).flat()[0] ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const response = await api.post('/login', {
        email,
        password,
      });

      const token = response.data.token;

      if (!token) {
        throw new Error('Login response did not contain an auth token.');
      }

      localStorage.setItem('auth_token', token);

      setIsLoggedIn(true);
      setPassword('');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please check your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn) {
    return (
      <Dashboard
        onLogout={() => {
          localStorage.removeItem('auth_token');
          setIsLoggedIn(false);
          setPage('login');
          setEmail('');
          setPassword('');
          resetMessages();
        }}
      />
    );
  }

  return (
    <div className="app-container">
      <div className="login-card">
        <div className="logo">TM</div>

        <h1>{page === 'login' ? 'Welcome Back' : 'Create Account'}</h1>

        <p className="subtitle">
          {page === 'login'
            ? 'Sign in to manage your tasks and stay productive.'
            : 'Create your account and start managing your work.'}
        </p>

        {error && <div className="form-error">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={page === 'login' ? handleLogin : handleRegister}>
          {page === 'register' && (
            <>
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </>
          )}

          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={
              page === 'login' ? 'current-password' : 'new-password'
            }
            minLength={8}
            required
          />

          {page === 'register' && (
            <>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </>
          )}

          <button type="submit" disabled={loading}>
            {loading
              ? 'Please wait...'
              : page === 'login'
                ? 'Sign In'
                : 'Create Account'}
          </button>
        </form>

        <p className="footer-text">
          {page === 'login'
            ? "Don't have an account? "
            : 'Already have an account? '}

          <button
            type="button"
            className="auth-switch-btn"
            onClick={() => {
              setPage(page === 'login' ? 'register' : 'login');
              setPassword('');
              setConfirmPassword('');
              resetMessages();
            }}
          >
            {page === 'login' ? 'Register' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default App;