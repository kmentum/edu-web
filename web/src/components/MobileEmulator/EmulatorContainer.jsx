import React, { useContext, useState } from 'react';
import { AppStateContext } from '../../context/AppStateContext';
import AppAuth from './AppAuth';
import AppProfileSetup from './AppProfileSetup';
import AppFeed from './AppFeed';
import AppPostDetail from './AppPostDetail';
import AppReceiptAuth from './AppReceiptAuth';
import AppCalendar from './AppCalendar';
import AppMyPage from './AppMyPage';

export const EmulatorContainer = () => {
  const { 
    currentUser,
    notifications,
    activeNotification,
    clearNotifications,
    markNotificationsAsRead,
    showNotifDropdown,
    setShowNotifDropdown,
    theme
  } = useContext(AppStateContext);
  
  // Custom router screen states: 'auth', 'profile-setup', 'feed', 'post-detail', 'add-post', 'receipt', 'calendar', 'mypage'
  const [currentScreen, setCurrentScreen] = useState('auth');
  const [selectedPostId, setSelectedPostId] = useState(null);

  // Sync screen router state with authentication boundaries
  React.useEffect(() => {
    if (!currentUser) {
      setCurrentScreen('auth');
      setShowNotifDropdown(false);
    } else if (currentScreen === 'auth') {
      // 자동 리다이렉트: 로그인 성공 시 프로필 완료 여부에 따라 피드 또는 프로필 셋업으로 이동
      if (currentUser.schoolName && currentUser.region) {
        setCurrentScreen('feed');
      } else {
        setCurrentScreen('profile-setup');
      }
    }
  }, [currentUser, currentScreen]);

  const handleNavigate = (screenName) => {
    setCurrentScreen(screenName);
    setShowNotifDropdown(false); // Close dropdown on navigate
  };

  const handleSelectPost = (postId) => {
    setSelectedPostId(postId);
  };

  // Render proper screen view based on state
  const renderScreenContent = () => {
    switch (currentScreen) {
      case 'auth':
        return <AppAuth onNavigate={handleNavigate} />;
      case 'profile-setup':
        return <AppProfileSetup onNavigate={handleNavigate} />;
      case 'feed':
      case 'add-post':
        return (
          <AppFeed 
            onNavigate={handleNavigate} 
            onSelectPost={handleSelectPost} 
            screenMode={currentScreen} 
          />
        );
      case 'post-detail':
        return (
          <AppPostDetail 
            postId={selectedPostId} 
            onNavigate={handleNavigate} 
          />
        );
      case 'receipt':
        return <AppReceiptAuth onNavigate={handleNavigate} />;
      case 'calendar':
        return <AppCalendar onNavigate={handleNavigate} />;
      case 'mypage':
        return <AppMyPage onNavigate={handleNavigate} onSelectPost={handleSelectPost} />;
      default:
        return <AppAuth onNavigate={handleNavigate} />;
    }
  };

  // Highlight bottom navigation tab
  const getActiveNavTab = () => {
    if (['feed', 'post-detail'].includes(currentScreen)) return 'feed';
    if (currentScreen === 'receipt') return 'receipt';
    if (currentScreen === 'calendar') return 'calendar';
    if (currentScreen === 'add-post') return 'add-post';
    return '';
  };

  const activeNavTab = getActiveNavTab();

  return (
    <div className="simulator-section">
      <div className="simulator-title-badge">📱 PARENT APP EMULATOR</div>
      
      <div className="phone-mockup">
        {/* Notch */}
        <div className="phone-notch" />

        {/* Status Bar */}
        <div className="phone-status-bar">
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>15:45</span>
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <span>📶</span>
            <span>📶</span>
            <span>🔋 85%</span>
          </div>
        </div>

        {/* Dynamic Screen Area */}
        <div className={`phone-screen ${theme === 'dark' ? 'dark-theme' : ''}`}>
          


          {/* V2: Notification Dropdown Center Card */}
          {showNotifDropdown && currentUser && (
            <div className="notif-dropdown-container">
              <div style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--neutral-dark)' }}>🔔 실시간 구독 알림 내역</span>
                <button 
                  onClick={clearNotifications}
                  style={{ fontSize: '0.62rem', color: 'var(--accent-red)', fontWeight: '600' }}
                >
                  전체삭제
                </button>
              </div>
              <div style={{ overflowY: 'auto', flex: 1, padding: '4px', background: '#fafafa' }}>
                {notifications.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--neutral-muted)', fontSize: '0.7rem', padding: '30px 10px', fontStyle: 'italic' }}>
                    수신된 알림이 없습니다.
                  </p>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id}
                      style={{
                        padding: '8px 10px',
                        borderBottom: '1px solid #f1f5f9',
                        fontSize: '0.68rem',
                        lineHeight: '1.3',
                        backgroundColor: notif.unread ? '#f0fdfa' : 'white',
                        borderLeft: notif.unread ? '3px solid var(--secondary)' : ''
                      }}
                    >
                      <div>{notif.text}</div>
                      <div style={{ color: 'var(--neutral-muted)', fontSize: '0.6rem', marginTop: '2px', textAlign: 'right' }}>
                        {new Date(notif.time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* V2: Slide-Down iOS Push Notification Toast overlay */}
          {activeNotification && (
            <div className="push-toast-container">
              <div style={{ fontSize: '1.1rem' }}>💬</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.62rem', fontWeight: '700', opacity: '0.8', display: 'flex', justifyContent: 'space-between' }}>
                  <span>학사 알림 구독 센터</span>
                  <span>방금 전</span>
                </div>
                <p style={{ fontSize: '0.7rem', marginTop: '2px', fontWeight: '500', lineHeight: '1.3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activeNotification.text}
                </p>
              </div>
            </div>
          )}

          {renderScreenContent()}
        </div>

        {/* Bottom Nav Bar (visible only when logged in) */}
        {currentUser && currentScreen !== 'auth' && currentScreen !== 'profile-setup' && (
          <div className="mobile-nav-bar">
            <button 
              className={`nav-item-btn ${activeNavTab === 'feed' ? 'active' : ''}`}
              onClick={() => handleNavigate('feed')}
            >
              <span className="nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </span>
              <span>커뮤니티</span>
            </button>
            <button 
              className={`nav-item-btn ${activeNavTab === 'calendar' ? 'active' : ''}`}
              onClick={() => handleNavigate('calendar')}
            >
              <span className="nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                  <path d="M8 14h.01" />
                  <path d="M12 14h.01" />
                  <path d="M16 14h.01" />
                  <path d="M8 18h.01" />
                  <path d="M12 18h.01" />
                  <path d="M16 18h.01" />
                </svg>
              </span>
              <span>학사일정</span>
            </button>
            <button 
              className={`nav-item-btn ${activeNavTab === 'receipt' ? 'active' : ''}`}
              onClick={() => handleNavigate('receipt')}
            >
              <span className="nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
                  <path d="M16 8H8" />
                  <path d="M16 12H8" />
                  <path d="M16 16H10" />
                </svg>
              </span>
              <span>영수증</span>
            </button>
            <button 
              className={`nav-item-btn nav-write-btn ${activeNavTab === 'add-post' ? 'active' : ''}`}
              onClick={() => handleNavigate('add-post')}
            >
              <span className="nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </span>
              <span>글쓰기</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default EmulatorContainer;
