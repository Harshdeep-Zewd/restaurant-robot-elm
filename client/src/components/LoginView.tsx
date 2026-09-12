import React, { useState } from 'react';
import { UserCheck, Play, Key, Lock, Cpu, Sparkles, ArrowRight, Link, Copy, Check } from 'lucide-react';
import { User } from '../types/elm';
import { authService } from '../api/auth';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'DEMO' | 'ZEWD'>('DEMO');
  const [username, setUsername] = useState('zewd');
  const [password, setPassword] = useState('zewd123');
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : 'https://restaurant-robot-elm-server.vercel.app';
  const demoUrl = `${baseUrl}?account=demo`;
  const zewdUrl = `${baseUrl}?account=zewd`;

  const handleCopy = (url: string, type: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(null), 2500);
  };

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
    const targetUser = authService.getUsers().find(u => u.username === uname || u.name.toLowerCase().includes(uname));
    const pwd = targetUser?.password || 'zewd123';
    const res = authService.login(uname, pwd);
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
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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
          Lifecycle Engineering Workspace
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '6px', maxWidth: '560px' }}>
          ISO 13482 Robotics Safety Standard, Traceability Matrix, & Engineering Trackers.
        </p>
      </div>

      {/* Main Login Card */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        width: '480px',
        maxWidth: '100%',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Role Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-sidebar)' }}>
          <button
            onClick={() => { setActiveTab('DEMO'); setError(''); }}
            style={{
              flex: 1, padding: '14px 0', fontSize: '0.9rem', fontWeight: 700,
              color: activeTab === 'DEMO' ? 'var(--accent-emerald)' : 'var(--text-muted)',
              borderBottom: activeTab === 'DEMO' ? '3px solid var(--accent-emerald)' : 'none',
              backgroundColor: activeTab === 'DEMO' ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            <Sparkles size={16} />
            <span>Public Demo Account</span>
          </button>

          <button
            onClick={() => { setActiveTab('ZEWD'); setError(''); setUsername('zewd'); setPassword('zewd123'); }}
            style={{
              flex: 1, padding: '14px 0', fontSize: '0.9rem', fontWeight: 700,
              color: activeTab === 'ZEWD' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              borderBottom: activeTab === 'ZEWD' ? '3px solid var(--accent-cyan)' : 'none',
              backgroundColor: activeTab === 'ZEWD' ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            <UserCheck size={16} />
            <span>Zewd Account (Owner)</span>
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
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  Interactive Public Demo Sandbox
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
                <span>Launch Demo & Open Project Page</span>
              </button>
            </div>
          )}

          {activeTab === 'ZEWD' && (
            <form onSubmit={handleUserSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Username / Account *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ width: '100%', paddingLeft: '36px', fontSize: '0.9rem', fontWeight: 600 }}
                    placeholder="zewd"
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
                    placeholder="zewd123"
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
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <span>Sign In to Zewd Project Page</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}
        </div>

        {/* Direct Access Links Cheat Sheet */}
        <div style={{
          backgroundColor: 'var(--bg-dark)',
          borderTop: '1px solid var(--border-color)',
          padding: '16px 20px'
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Link size={14} color="var(--accent-cyan)" />
            <span>Direct Project Access Links:</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Demo Link */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              padding: '8px 12px'
            }}>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  🎭 Public Demo Link
                </div>
                <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {demoUrl}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginLeft: '10px' }}>
                <button
                  onClick={() => handleCopy(demoUrl, 'demo')}
                  style={{
                    backgroundColor: 'transparent', color: 'var(--accent-emerald)', border: 'none', cursor: 'pointer', padding: '4px'
                  }}
                  title="Copy Demo Link"
                >
                  {copiedLink === 'demo' ? <Check size={16} /> : <Copy size={16} />}
                </button>
                <a
                  href={demoUrl}
                  style={{
                    backgroundColor: 'var(--accent-emerald)', color: '#000', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, textDecoration: 'none'
                  }}
                >
                  Open
                </a>
              </div>
            </div>

            {/* Zewd Link */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '8px',
              padding: '8px 12px'
            }}>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                  👑 Zewd Account Link (Owner)
                </div>
                <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {zewdUrl}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginLeft: '10px' }}>
                <button
                  onClick={() => handleCopy(zewdUrl, 'zewd')}
                  style={{
                    backgroundColor: 'transparent', color: 'var(--accent-cyan)', border: 'none', cursor: 'pointer', padding: '4px'
                  }}
                  title="Copy Zewd Link"
                >
                  {copiedLink === 'zewd' ? <Check size={16} /> : <Copy size={16} />}
                </button>
                <a
                  href={zewdUrl}
                  style={{
                    backgroundColor: 'var(--accent-cyan)', color: '#000', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800, textDecoration: 'none'
                  }}
                >
                  Open
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
