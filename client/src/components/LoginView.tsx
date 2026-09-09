import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Play, Key, Lock, Cpu, Sparkles, ArrowRight } from 'lucide-react';
import { User } from '../types/elm';
import { authService } from '../api/auth';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'DEMO' | 'USER' | 'ADMIN'>('DEMO');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleDemoClick = () => {
    const u = authService.loginAsDemo();
    onLoginSuccess(u);
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = authService.login(username, password);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setError(res.message || 'Login failed. Please check credentials.');
    }
  };

  const handleQuickLogin = (uname: string) => {
    setError('');
    const res = authService.login(uname, '123');
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setError(res.message || 'Failed to login with default credentials.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-dark)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(56, 189, 248, 0.08) 0%, transparent 60%)'
    }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'rgba(56, 189, 248, 0.12)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          padding: '8px 18px',
          borderRadius: '9999px',
          color: 'var(--accent-cyan)',
          fontWeight: 700,
          fontSize: '0.85rem',
          marginBottom: '16px'
        }}>
          <Cpu size={18} />
          <span>ROBOSERV-X1 AUTONOMOUS SYSTEMS PLATFORM</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Lifecycle Engineering & Safety Compliance
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '6px', maxWidth: '560px' }}>
          ISO 13482 Robotics Safety Standard Workspace, Bidirectional Traceability, & Custom Trackers.
        </p>
      </div>

      {/* Main Login Card */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        width: '460px',
        maxWidth: '100%',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Role Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-sidebar)' }}>
          <button
            onClick={() => { setActiveTab('DEMO'); setError(''); }}
            style={{
              flex: 1, padding: '14px 0', fontSize: '0.85rem', fontWeight: 700,
              color: activeTab === 'DEMO' ? 'var(--accent-emerald)' : 'var(--text-muted)',
              borderBottom: activeTab === 'DEMO' ? '3px solid var(--accent-emerald)' : 'none',
              backgroundColor: activeTab === 'DEMO' ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            <Sparkles size={16} />
            <span>Public Demo</span>
          </button>

          <button
            onClick={() => { setActiveTab('USER'); setError(''); setUsername('zewd'); }}
            style={{
              flex: 1, padding: '14px 0', fontSize: '0.85rem', fontWeight: 700,
              color: activeTab === 'USER' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              borderBottom: activeTab === 'USER' ? '3px solid var(--accent-cyan)' : 'none',
              backgroundColor: activeTab === 'USER' ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            <UserCheck size={16} />
            <span>User Login</span>
          </button>

          <button
            onClick={() => { setActiveTab('ADMIN'); setError(''); setUsername('admin'); }}
            style={{
              flex: 1, padding: '14px 0', fontSize: '0.85rem', fontWeight: 700,
              color: activeTab === 'ADMIN' ? 'var(--accent-amber)' : 'var(--text-muted)',
              borderBottom: activeTab === 'ADMIN' ? '3px solid var(--accent-amber)' : 'none',
              backgroundColor: activeTab === 'ADMIN' ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            <ShieldCheck size={16} />
            <span>Admin Owner</span>
          </button>
        </div>

        {/* Tab Body */}
        <div style={{ padding: '24px' }}>
          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: 'var(--accent-rose)',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          {activeTab === 'DEMO' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '20px'
              }}>
                <Sparkles size={28} color="var(--accent-emerald)" style={{ marginBottom: '8px' }} />
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  Interactive GitHub Demo Sandbox
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
                  Explore full features (custom trackers, procedure steps, file uploads). <strong>State automatically resets on tab refresh!</strong>
                </div>
              </div>

              <button
                onClick={handleDemoClick}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--accent-emerald)',
                  color: '#000',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                  cursor: 'pointer'
                }}
              >
                <Play size={18} fill="#000" />
                <span>Launch Live Public Demo Now</span>
              </button>
            </div>
          )}

          {(activeTab === 'USER' || activeTab === 'ADMIN') && (
            <form onSubmit={handleUserSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {activeTab === 'ADMIN' ? 'Admin Owner Username *' : 'Username *'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ width: '100%', paddingLeft: '36px', fontSize: '0.9rem', fontWeight: 600 }}
                    placeholder={activeTab === 'ADMIN' ? 'admin' : 'e.g. zewd or engineer'}
                  />
                  <Key size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Password *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', paddingLeft: '36px', fontSize: '0.9rem' }}
                    placeholder="Enter password..."
                  />
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: activeTab === 'ADMIN' ? 'var(--accent-amber)' : 'var(--primary)',
                  color: activeTab === 'ADMIN' ? '#000' : '#fff',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <span>{activeTab === 'ADMIN' ? 'Sign In as Admin Owner' : 'Sign In to Workspace'}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}
        </div>

        {/* Quick Credentials Cheat Sheet */}
        <div style={{
          backgroundColor: 'var(--bg-dark)',
          borderTop: '1px solid var(--border-color)',
          padding: '16px 20px'
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Quick Demo Sign-In Credentials (Click to Fill):
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button
              onClick={() => handleQuickLogin('admin')}
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--accent-amber)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              👑 Admin Owner (`admin`)
            </button>

            <button
              onClick={() => handleQuickLogin('zewd')}
              style={{
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: 'var(--accent-cyan)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              👤 Zewd (`zewd`)
            </button>

            <button
              onClick={() => handleQuickLogin('engineer')}
              style={{
                backgroundColor: 'rgba(148, 163, 184, 0.15)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              💻 Engineer (`engineer`)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
