import React, { useContext, useState } from 'react';
import { AppStateContext } from '../../context/AppStateContext';
import { isSupabaseConfigured } from '../../lib/supabaseClient';

export const AppAuth = ({ onNavigate }) => {
  const { signUpWithEmail, loginWithEmail, loginWithGoogle } = useContext(AppStateContext);

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSuggestions, setEmailSuggestions] = useState([]);

  const emailDomains = ['gmail.com', 'naver.com', 'daum.net', 'hanmail.net', 'nate.com'];

  const handleEmailChange = (val) => {
    setEmail(val);
    if (!val.trim()) {
      setEmailSuggestions([]);
      return;
    }
    const parts = val.split('@');
    if (parts.length === 1 || (parts.length === 2 && !parts[1])) {
      const username = parts[0];
      if (username) {
        setEmailSuggestions(emailDomains.map(domain => `${username}@${domain}`));
      } else {
        setEmailSuggestions([]);
      }
    } else {
      setEmailSuggestions([]);
    }
  };

  const isNativeApp = typeof window !== 'undefined' && !!window.Capacitor;

  const handleRealGoogleLogin = async () => {
    if (isNativeApp) {
      if (window.confirm('⚠️ 모바일 앱 환경 안내:\n모바일 앱 환경에서는 실제 구글 로그인 연동 시 단말기 딥링크 및 Supabase 리다이렉트 설정이 추가로 연계되어 있어야 최종 앱으로 복귀할 수 있습니다.\n\n로컬 테스트 시 딥링크가 미세팅 상태라면 이메일 기반 자체 가입/로그인을 통해 편리하게 접속하시기를 권장합니다.\n\n구글 로그인을 계속 진행하시겠습니까?')) {
        await loginWithGoogle();
      }
    } else {
      await loginWithGoogle();
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      alert('이메일과 비밀번호를 모두 입력해 주세요.');
      return;
    }
    if (password.length < 6) {
      alert('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    if (isSignUp) {
      if (!name.trim()) {
        alert('회원가입을 위해 이름을 입력해 주세요.');
        setLoading(false);
        return;
      }
      const success = await signUpWithEmail(name.trim(), email.trim(), password);
      setLoading(false);
      if (success) {
        // MOCK 모드는 자동 로그인이 되므로 바로 profile-setup으로 리다이렉트
        if (!isSupabaseConfigured) {
          onNavigate('profile-setup');
        } else {
          // Supabase 모드는 회원가입 승인 대기 또는 직접 로그인 유도
          setIsSignUp(false);
          setPassword('');
        }
      }
    } else {
      const success = await loginWithEmail(email.trim(), password);
      setLoading(false);
      if (success) {
        onNavigate('feed');
      }
    }
  };

  return (
    <div className="mobile-app-layout animate-fade-in" style={{ backgroundColor: '#ffffff', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px' }}>
      
      {/* Mini Brand Logo */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '8px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))' }}>🎒</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.8px', color: 'var(--neutral-dark)', margin: 0 }}>
          반넷 (Barnet)
        </h2>
        <p style={{ color: 'var(--neutral-muted)', fontSize: '0.78rem', marginTop: '4px', fontWeight: '500' }}>
          인증된 학부모들만의 고품격 가명 소통 광장
        </p>
      </div>

      {/* Auth Card Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Google SSO Button */}
        <button 
          type="button" 
          className="google-sso-btn"
          onClick={handleRealGoogleLogin}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            padding: '12px',
            fontSize: '0.82rem',
            fontWeight: '600',
            color: 'var(--neutral-dark)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Google 계정으로 로그인
        </button>

        {/* Separator */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
          <span style={{ padding: '0 12px', fontSize: '0.68rem', color: 'var(--neutral-muted)', fontWeight: '600' }}>
            또는 이메일로 {isSignUp ? '가입' : '로그인'}
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="email"
            className="text-input"
            placeholder="이메일 주소"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            disabled={loading}
            style={{
              padding: '12px 14px',
              fontSize: '0.82rem',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              transition: 'border-color 0.2s ease'
            }}
          />

          {/* Email suggestions chip list */}
          {emailSuggestions.length > 0 && (
            <div 
              className="no-scrollbar"
              style={{
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                padding: '4px 0 6px',
                whiteSpace: 'nowrap',
                marginTop: '-4px'
              }}
            >
              {emailSuggestions.map((suggestion) => (
                <button
                  type="button"
                  key={suggestion}
                  onClick={() => {
                    setEmail(suggestion);
                    setEmailSuggestions([]);
                  }}
                  className="filter-badge"
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    margin: 0,
                    backgroundColor: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    color: 'var(--primary)',
                    borderRadius: '20px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {isSignUp && (
            <input
              type="text"
              className="text-input"
              placeholder="학부모 실명 (예: 김은아)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              style={{
                padding: '12px 14px',
                fontSize: '0.82rem',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                transition: 'border-color 0.2s ease'
              }}
            />
          )}

          <input
            type="password"
            className="text-input"
            placeholder="비밀번호 (6자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            style={{
              padding: '12px 14px',
              fontSize: '0.82rem',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#f8fafc',
              transition: 'border-color 0.2s ease'
            }}
          />

          <button
            type="submit"
            disabled={loading}
            className="action-btn action-btn-primary"
            style={{
              padding: '12px',
              fontSize: '0.82rem',
              fontWeight: '700',
              borderRadius: '12px',
              backgroundColor: 'var(--primary)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)',
              marginTop: '6px'
            }}
          >
            {loading ? '처리 중...' : isSignUp ? '반넷 가입하기' : '로그인'}
          </button>
        </form>

        {/* Toggle Mode Link */}
        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setName('');
              setPassword('');
              setEmail('');
              setEmailSuggestions([]);
            }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.75rem',
              color: 'var(--primary)',
              fontWeight: '700',
              cursor: 'pointer',
              textDecoration: 'none'
            }}
          >
            {isSignUp ? '이미 계정이 있으신가요? 로그인' : '아직 계정이 없으신가요? 회원가입'}
          </button>
        </div>

      </div>

      {/* Footer copyright */}
      <div style={{ marginTop: 'auto', paddingTop: '20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--neutral-muted)', fontSize: '0.62rem', margin: 0 }}>
          © 2026 Barnet. All rights reserved.
        </p>
      </div>

    </div>
  );
};

export default AppAuth;
