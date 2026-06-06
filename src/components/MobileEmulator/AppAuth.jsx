import React, { useContext, useState } from 'react';
import { AppStateContext } from '../../context/AppStateContext';
import { isSupabaseConfigured } from '../../lib/supabaseClient';

export const AppAuth = ({ onNavigate }) => {
  const { users, loginWithMockAccount, loginCustomEmail, loginWithGoogle } = useContext(AppStateContext);
  
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [showDemoOptions, setShowDemoOptions] = useState(!isSupabaseConfigured);

  // Only show active or banned mock users for testing
  const mockLoginAccounts = users.filter(u => u.uid.startsWith('google-user-'));

  const handleMockLogin = (uid) => {
    const success = loginWithMockAccount(uid);
    if (success) {
      const user = users.find(u => u.uid === uid);
      if (user.schoolName && user.region) {
        onNavigate('feed');
      } else {
        onNavigate('profile-setup');
      }
    }
  };

  const handleRealGoogleLogin = async () => {
    if (isSupabaseConfigured) {
      await loginWithGoogle();
    } else {
      alert('⚠️ Supabase 미설정:\n현재 로컬 데모 모드입니다. 구글 실시간 로그인을 이용하려면 .env에 Supabase 환경변수를 입력해 주세요.\n\n하단의 [데모 시뮬레이션 로그인 열기]를 클릭해 테스트 계정으로 접속할 수 있습니다.');
    }
  };

  const handleCustomLogin = (e) => {
    e.preventDefault();
    if (!customName.trim() || !customEmail.trim()) {
      alert('이름과 이메일을 모두 입력해 주세요.');
      return;
    }
    if (!customEmail.includes('@')) {
      alert('올바른 이메일 형식이 아닙니다.');
      return;
    }

    const success = loginCustomEmail(customName, customEmail);
    if (success) {
      // Find if they are existing
      const existing = users.find(u => u.email === customEmail);
      if (existing && existing.schoolName && existing.region) {
        onNavigate('feed');
      } else {
        onNavigate('profile-setup');
      }
    }
  };

  return (
    <div className="mobile-auth-screen animate-fade-in">
      <div className="auth-header" style={{ marginBottom: '40px' }}>
        <div className="auth-icon" style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎒</div>
        <h2 style={{ fontSize: '1.6rem', letterSpacing: '-0.5px' }}>반넷 (Barnet)</h2>
        <p style={{ color: 'var(--neutral-muted)', fontSize: '0.85rem' }}>인증된 학부모들만의 익명 소통 광장</p>
      </div>

      <div className="auth-real-section animate-slide-up">
        {/* Google Official-style login button */}
        <button 
          type="button" 
          className="google-sso-btn"
          onClick={handleRealGoogleLogin}
        >
          <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Google 계정으로 로그인
        </button>
        
        <p className="auth-terms-notice">
          로그인 시 반넷의 <strong>이용약관</strong> 및 <strong>개인정보처리방침</strong>에 동의하는 것으로 간주됩니다.
        </p>
      </div>

      {/* Hidden/Collapsible Simulation Area for developers/demo usage */}
      <div className="demo-toggle-area" style={{ marginTop: 'auto', paddingTop: '24px', textAlign: 'center' }}>
        <button 
          type="button" 
          onClick={() => setShowDemoOptions(!showDemoOptions)}
          style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '0.65rem', 
            color: 'var(--neutral-muted)', 
            cursor: 'pointer', 
            textDecoration: 'underline' 
          }}
        >
          {showDemoOptions ? '데모 시뮬레이션 설정 숨기기' : '🛠️ 데모 시뮬레이션 로그인 열기'}
        </button>
      </div>

      {showDemoOptions && (
        <div className="demo-section-card animate-slide-up" style={{
          marginTop: '12px',
          padding: '16px',
          backgroundColor: '#fafafa',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: '700', color: '#64748b' }}>🛠️ LOCAL DEMO SIMULATOR</span>
            {isSupabaseConfigured ? (
              <span className="badge badge-teal" style={{ fontSize: '0.58rem' }}>LIVE 연동</span>
            ) : (
              <span className="badge badge-gold" style={{ fontSize: '0.58rem' }}>MOCK 모드</span>
            )}
          </div>
          
          <div className="input-group" style={{ marginBottom: '8px' }}>
            <span className="input-label" style={{ fontSize: '0.62rem' }}>원클릭 모의 계정 로그인</span>
          </div>

          <div className="auth-google-btn-list" style={{ gap: '8px', marginBottom: '12px' }}>
            {mockLoginAccounts.map(account => (
              <button 
                key={account.uid}
                className="auth-google-btn"
                style={{ padding: '8px 12px' }}
                onClick={() => handleMockLogin(account.uid)}
              >
                <div className="avatar" style={{ width: '26px', height: '26px', fontSize: '0.75rem', marginRight: '8px' }}>
                  {account.name.charAt(0)}
                </div>
                <div className="user-info">
                  <div className="user-name" style={{ fontSize: '0.78rem' }}>
                    {account.name} {account.isBanned && <span className="badge badge-red" style={{fontSize: '0.55rem'}}>정지</span>}
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem' }}>🔑</span>
              </button>
            ))}
          </div>

          <div className="auth-divider" style={{ margin: '8px 0', fontSize: '0.65rem' }}>또는 모의 이메일 가입</div>

          <form className="auth-custom-form" style={{ gap: '8px' }} onSubmit={handleCustomLogin}>
            <input
              type="text"
              className="text-input"
              style={{ padding: '8px 10px', fontSize: '0.78rem' }}
              placeholder="이름 (실명)"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
            <input
              type="email"
              className="text-input"
              style={{ padding: '8px 10px', fontSize: '0.78rem' }}
              placeholder="이메일 주소"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
            />
            <button type="submit" className="submit-btn" style={{ padding: '8px', fontSize: '0.78rem' }}>
              시뮬레이션 가입/로그인
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
export default AppAuth;
