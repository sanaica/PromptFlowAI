import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const LoginPage = () => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  // ✅ Listen for auth state changes (catches Google OAuth redirect callback)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/dashboard');
      }
    });

    // ✅ Also check if user is already logged in on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/dashboard');
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      console.log('Logged in user:', data.user.user_metadata.full_name);
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin + '/dashboard',
      },
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({
        type: 'success',
        text: 'Account created! Check your email to confirm your account, then sign in.',
      });
      setTimeout(() => {
        setMode('login');
        setMessage(null);
      }, 4000);
    }
    setLoading(false);
  };

  // ✅ Fixed Google login handler
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
      setGoogleLoading(false);
    }
    // No need to setGoogleLoading(false) on success — page will redirect
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      boxSizing: 'border-box',
      margin: 0,
      padding: 0,
    }}>
      {/* Left Image Panel */}
      <div style={{
        flex: '0 0 45%',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-end',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1400)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
        }} />
        <div style={{
          position: 'relative',
          zIndex: 1,
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}>
          <div style={{
            fontFamily: 'var(--font-heading, sans-serif)',
            fontSize: '1.6rem',
            fontWeight: 700,
            color: 'white',
            marginBottom: '0.25rem',
          }}>
            PromptFlow<span style={{ color: '#a5b4fc' }}>.</span>
          </div>
          <h2 style={{
            color: 'white',
            fontSize: '1.4rem',
            margin: 0,
            fontFamily: 'var(--font-heading, sans-serif)',
          }}>
            AI-Powered Video Editing
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
            Describe your edit in plain language. PromptFlow does the rest.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div style={{
        flex: '0 0 55%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto',
        background: 'var(--bg-surface, #0f0f1a)',
        boxSizing: 'border-box',
        padding: '2rem',
      }}>
        <div style={{ width: '100%', maxWidth: '420px', boxSizing: 'border-box' }}>

          {/* Toggle */}
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '1.5rem',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setMessage(null); }}
                style={{
                  flex: 1,
                  padding: '0.55rem',
                  borderRadius: '7px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  background: mode === m ? 'var(--ref-primary, #6366f1)' : 'transparent',
                  color: mode === m ? 'white' : 'rgba(255,255,255,0.45)',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Feedback message */}
          {message && (
            <div style={{
              padding: '0.7rem 1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.82rem',
              background: message.type === 'error' ? 'rgba(255,71,87,0.15)' : 'rgba(56,176,0,0.15)',
              border: `1px solid ${message.type === 'error' ? 'rgba(255,71,87,0.4)' : 'rgba(56,176,0,0.4)'}`,
              color: message.type === 'error' ? '#ff6b7a' : '#7ed957',
            }}>
              {message.text}
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 className="gradient-text" style={{ fontSize: '1.5rem', margin: '0 0 0.25rem' }}>
                Welcome Back
              </h2>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input
                  type="email"
                  className="ref-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label">Password</label>
                <input
                  type="password"
                  className="ref-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="ref-btn" disabled={loading} style={{ marginTop: '0.25rem' }}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* SIGNUP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleEmailSignup} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <h2 className="gradient-text" style={{ fontSize: '1.5rem', margin: '0 0 0.1rem' }}>
                Create Account
              </h2>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  className="ref-input"
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input
                  type="email"
                  className="ref-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label">Password</label>
                <input
                  type="password"
                  className="ref-input"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <input
                  type="password"
                  className="ref-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="ref-btn" disabled={loading} style={{ marginTop: '0.25rem' }}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* OAuth divider */}
          <div className="divider" style={{ margin: '1.25rem 0' }}>OR</div>

          {/* ✅ Google button with loading state */}
          <button
            className="ref-oauth-btn"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            style={{ opacity: googleLoading ? 0.7 : 1, cursor: googleLoading ? 'not-allowed' : 'pointer' }}
          >
            {googleLoading ? (
              <span style={{ fontSize: '0.85rem' }}>Redirecting to Google...</span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <span style={{ color: 'var(--ref-primary, #6366f1)', cursor: 'pointer' }} onClick={() => setMode('signup')}>Sign up</span>
              </>
            ) : (
              <>Already have an account?{' '}
                <span style={{ color: 'var(--ref-primary, #6366f1)', cursor: 'pointer' }} onClick={() => setMode('login')}>Sign in</span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;