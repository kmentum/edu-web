import React, { useContext, useState } from 'react';
import { AppStateContext } from '../../context/AppStateContext';

export const AppAuth = ({ onNavigate }) => {
  const { users, loginWithMockAccount, loginCustomEmail } = useContext(AppStateContext);
  
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

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
      <div className="auth-header">
        <div className="auth-icon">👨‍👩‍👧‍👦</div>
        <h2>학부모 교육 커뮤니티</h2>
        <p>구글 SSO 기반 인증으로 안심하고 대화하세요</p>
      </div>

      <div className="input-group" style={{ marginBottom: '12px' }}>
        <span className="input-label">테스트용 구글 계정 선택 (원클릭 로그인)</span>
      </div>

      <div className="auth-google-btn-list">
        {mockLoginAccounts.map(account => (
          <button 
            key={account.uid}
            className="auth-google-btn"
            onClick={() => handleMockLogin(account.uid)}
          >
            <div className="avatar">
              {account.name.charAt(0)}
            </div>
            <div className="user-info">
              <div className="user-name">
                {account.name} {account.isBanned && <span className="badge badge-red" style={{fontSize: '0.6rem'}}>정지됨</span>}
              </div>
              <div className="user-email">{account.email}</div>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--neutral-muted)' }}>🔑</span>
          </button>
        ))}
      </div>

      <div className="auth-divider">또는 직접 이메일로 가입/로그인</div>

      <form className="auth-custom-form" onSubmit={handleCustomLogin}>
        <div className="input-group">
          <label className="input-label" htmlFor="custom-name">이름 (구글 실명)</label>
          <input
            id="custom-name"
            type="text"
            className="text-input"
            placeholder="홍길동"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label className="input-label" htmlFor="custom-email">구글 이메일</label>
          <input
            id="custom-email"
            type="email"
            className="text-input"
            placeholder="gildong@gmail.com"
            value={customEmail}
            onChange={(e) => setCustomEmail(e.target.value)}
          />
        </div>
        <button type="submit" className="submit-btn" style={{ marginTop: '6px' }}>
          구글 SSO 간편 로그인 시뮬레이션
        </button>
      </form>
    </div>
  );
};
export default AppAuth;
