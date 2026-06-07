import React, { useContext, useState } from 'react';
import { AppStateContext } from '../../context/AppStateContext';
import { mockPdfs } from '../../data/mockPdfData';
import AppPdfViewerModal from './AppPdfViewerModal';
// mockPdfs & AppPdfViewerModal used in purchases drawer

export const AppMyPage = ({ onNavigate, onSelectPost }) => {
  const { 
    currentUser, 
    logout, 
    updateUserPseudonym, 
    posts,
    theme,
    setTheme,
    notificationsEnabled,
    setNotificationsEnabled,
    updateUserPassword
  } = useContext(AppStateContext);

  const [selectedPdf, setSelectedPdf] = useState(null); // used in purchases drawer
  const [isEditingNick, setIsEditingNick] = useState(false);
  const [newNick, setNewNick] = useState(currentUser ? currentUser.pseudonym : '');
  
  // Drawer active state: null | 'posts' | 'invite' | 'announcements' | 'settings'
  const [activeDrawer, setActiveDrawer] = useState(null);
  
  // Settings Form States
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  
  // Announcements Accordion State
  const [expandedNotice, setExpandedNotice] = useState(null);

  if (!currentUser) return null;

  // --- Sub Render: My Posts List ---
  const renderMyPosts = () => {
    const myPosts = posts.filter(p => p.authorUid === currentUser.uid && !p.isBanned);
    
    if (myPosts.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--neutral-muted)', fontSize: '0.72rem', fontStyle: 'italic' }}>
          작성한 커뮤니티 글이 없습니다. 첫 글을 남겨 보세요!
        </div>
      );
    }
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {myPosts.map(post => (
          <div 
            key={post.id}
            onClick={() => {
              onSelectPost(post.id);
              onNavigate('post-detail');
              setActiveDrawer(null);
            }}
            className="mypage-section-card"
            style={{
              padding: '10px 12px',
              border: '1px solid var(--neutral-light)',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'transform 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'var(--neutral-muted)' }}>
              <span>{post.category} • {post.type === 'all' ? '전체광장' : post.type === 'school' ? '우리학교' : '우리동네'}</span>
              <span>{new Date(post.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</span>
            </div>
            <h5 style={{ fontSize: '0.78rem', fontWeight: '700', marginTop: '4px', color: 'var(--neutral-dark)' }}>
              {post.title}
            </h5>
          </div>
        ))}
      </div>
    );
  };

  // --- Sub Render: My Purchased PDFs ---
  const renderMyPurchases = () => {
    const purchasedIds = currentUser.purchasedPdfs || [];
    const purchasedList = mockPdfs.filter(p => purchasedIds.includes(p.id));

    if (purchasedList.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--neutral-muted)', fontSize: '0.72rem', fontStyle: 'italic' }}>
          구매한 자료가 없습니다.<br/>마켓에서 내신 족보 & 노하우 자료를 구매해 보세요!
          <button
            onClick={() => { setActiveDrawer(null); onNavigate('pdf-market'); }}
            className="action-btn action-btn-primary"
            style={{ display: 'block', margin: '12px auto 0', fontSize: '0.72rem', padding: '8px 20px' }}
          >
            📚 마켓 바로가기
          </button>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {purchasedList.map(pdf => (
          <div
            key={pdf.id}
            onClick={() => setSelectedPdf(pdf)}
            style={{
              background: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)',
              border: '1.5px solid #6ee7b7',
              borderRadius: '12px',
              padding: '12px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.58rem', background: '#d1fae5', color: '#065f46', fontWeight: '700', padding: '2px 6px', borderRadius: '4px' }}>
                📖 소장 완료
              </span>
              <span style={{ fontSize: '0.6rem', color: 'var(--neutral-muted)' }}>⭐ {pdf.rating.toFixed(1)}</span>
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--neutral-dark)', lineHeight: '1.3' }}>
              {pdf.title}
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--neutral-muted)' }}>
              {pdf.schoolName} · {pdf.pages}페이지
            </div>
            <div style={{ fontSize: '0.65rem', color: '#059669', fontWeight: '600', marginTop: '2px' }}>
              탭하여 열람하기 →
            </div>
          </div>
        ))}
        <button
          onClick={() => { setActiveDrawer(null); onNavigate('pdf-market'); }}
          style={{
            marginTop: '4px', padding: '8px', fontSize: '0.7rem', fontWeight: '700',
            background: 'none', border: '1.5px dashed #a7f3d0', borderRadius: '10px',
            color: '#059669', cursor: 'pointer', textAlign: 'center',
          }}
        >
          + 더 많은 자료 구경하기 → 마켓
        </button>
      </div>
    );
  };

  // --- Sub Render: Invite link ---
  const renderInviteLink = () => {
    const inviteText = `[학클] 대한민국 학부모들의 검증된 가명 소통 광장 '학클'에 학부모님을 초대합니다!\n\n자녀 정보(학교, 학년) 맞춤 교육 자료 교류와 내신 대비 족보 PDF 마켓을 1,000P 혜택과 함께 무료로 이용해 보세요.\n\n🔗 가입링크: https://kmentum.github.io/edu-web/`;
    
    const handleCopy = () => {
      navigator.clipboard.writeText(inviteText);
      alert('초대 링크 메시지가 클립보드에 성공적으로 복사되었습니다. 카카오톡이나 SMS로 다른 학부모님들께 공유해 보세요!');
    };
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '4px' }}>
        <p style={{ fontSize: '0.72rem', color: 'var(--neutral-text)', lineHeight: '1.4' }}>
          아래의 초대 메시지 텍스트를 복사하여 주변의 다른 학부모님(동네/학교/학원 맘)을 초대해 보세요!
        </p>
        
        <textarea
          readOnly
          value={inviteText}
          style={{
            width: '100%',
            height: '110px',
            fontSize: '0.68rem',
            padding: '10px',
            borderRadius: '10px',
            border: '1px solid var(--neutral-light)',
            backgroundColor: 'var(--neutral-bg)',
            color: 'var(--neutral-muted)',
            resize: 'none',
            lineHeight: '1.3'
          }}
        />
        
        <button 
          onClick={handleCopy}
          className="action-btn action-btn-primary"
          style={{ width: '100%', padding: '10px', fontSize: '0.78rem', fontWeight: '700', borderRadius: '10px', border: 'none' }}
        >
          📋 초대 링크 메시지 복사하기
        </button>
      </div>
    );
  };

  // --- Sub Render: Announcements ---
  const renderAnnouncements = () => {
    const notices = [
      {
        title: '📚 선배 맘 노하우 PDF 마켓 포인트 결제 런칭',
        date: '2026.06.05',
        content: '자녀 학교 및 학사일정과 직결되는 내신 대비 기출 족보 및 교육 노하우 PDF 결제 시스템이 런칭되었습니다. 회원 가입 시 지급되는 1,000P 포인트 및 영수증 인증으로 획득한 포인트로 자료를 즉시 구매 및 가상 다운로드해 볼 수 있습니다.'
      },
      {
        title: '🛡️ 영수증 스캔 인증 어뷰징(각도 조작/중복) 방지 패치',
        date: '2026.06.01',
        content: '동일 영수증 이미지의 다각도 재촬영을 통한 학원비 실적 적립 어뷰징을 방지하기 위해 [학원명 + 결제일시 + 결제금액]의 텍스트 교차 중복 매칭 방어 시스템을 완비했습니다. 중복 검출 시 등록이 자동차단되오니 주의바랍니다.'
      },
      {
        title: '🔐 실명 유출 없는 안전한 3단계 가명 프로필 가이드',
        date: '2026.05.28',
        content: '학클은 모든 활동 시 구글 실명 대신 동네와 학교명이 조합된 자동 가명 닉네임이 적용됩니다. 설정 ➡️ 프로필 수정에서 본인이 원하는 조합 닉네임으로 자유롭게 마스킹을 유지하며 커스텀 작명도 지원하오니 안심하고 활동하세요.'
      }
    ];
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {notices.map((n, idx) => {
          const isExpanded = expandedNotice === idx;
          return (
            <div 
              key={idx}
              style={{
                border: '1px solid var(--neutral-light)',
                borderRadius: '10px',
                overflow: 'hidden'
              }}
            >
              <div 
                onClick={() => setExpandedNotice(isExpanded ? null : idx)}
                style={{
                  padding: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '0.75rem',
                  color: 'var(--neutral-dark)',
                  backgroundColor: 'var(--neutral-bg)'
                }}
              >
                <div style={{ flex: 1, paddingRight: '8px' }}>
                  <div>{n.title}</div>
                  <span style={{ fontSize: '0.6rem', color: 'var(--neutral-muted)', fontWeight: '400' }}>{n.date}</span>
                </div>
                <span style={{ fontSize: '0.65rem' }}>{isExpanded ? '▲' : '▼'}</span>
              </div>
              
              {isExpanded && (
                <div style={{ padding: '12px', borderTop: '1px solid var(--neutral-light)', fontSize: '0.72rem', color: 'var(--neutral-text)', lineHeight: '1.4', backgroundColor: 'var(--white)' }}>
                  {n.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // --- Sub Render: Settings ---
  const renderSettings = () => {
    const handlePasswordChangeSubmit = async (e) => {
      e.preventDefault();
      if (!newPasswordInput || !confirmPasswordInput) {
        alert('새 비밀번호를 입력해 주세요.');
        return;
      }
      
      if (newPasswordInput !== confirmPasswordInput) {
        alert('새 비밀번호와 확인 입력이 일치하지 않습니다.');
        return;
      }
      
      const success = await updateUserPassword(newPasswordInput);
      if (success) {
        setNewPasswordInput('');
        setConfirmPasswordInput('');
      }
    };
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '4px' }}>
        {/* 1. Theme Settings */}
        <div>
          <span className="input-label" style={{ fontSize: '0.7rem', color: 'var(--neutral-dark)', marginBottom: '6px', display: 'block' }}>
            🎨 디바이스 테마 토글 (실시간 다크 모드)
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setTheme('light')}
              className={`filter-badge ${theme === 'light' ? 'active' : ''}`}
              style={{ flex: 1, textAlign: 'center', padding: '8px', fontSize: '0.72rem' }}
            >
              ☀️ 라이트 테마
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`filter-badge ${theme === 'dark' ? 'active' : ''}`}
              style={{ flex: 1, textAlign: 'center', padding: '8px', fontSize: '0.72rem' }}
            >
              🌙 다크 테마
            </button>
          </div>
        </div>

        {/* 2. Notification Toggle Settings */}
        <div style={{ borderTop: '1px solid var(--neutral-light)', paddingTop: '12px' }}>
          <span className="input-label" style={{ fontSize: '0.7rem', color: 'var(--neutral-dark)', marginBottom: '6px', display: 'block' }}>
            🔔 실시간 모바일 푸시 알림 설정
          </span>
          <div className="switch-container">
            <span className="switch-label">내 글의 신규 댓글 실시간 알림</span>
            <button 
              type="button"
              className={`switch-toggle-btn ${notificationsEnabled.comments ? 'active' : ''}`}
              onClick={() => setNotificationsEnabled(prev => ({ ...prev, comments: !prev.comments }))}
            />
          </div>
          <div className="switch-container">
            <span className="switch-label">학사일정 구독 및 대화방 알림</span>
            <button 
              type="button"
              className={`switch-toggle-btn ${notificationsEnabled.calendar ? 'active' : ''}`}
              onClick={() => setNotificationsEnabled(prev => ({ ...prev, calendar: !prev.calendar }))}
            />
          </div>
        </div>

        {/* 3. Password Change Form */}
        <div style={{ borderTop: '1px solid var(--neutral-light)', paddingTop: '12px' }}>
          <span className="input-label" style={{ fontSize: '0.7rem', color: 'var(--neutral-dark)', marginBottom: '6px', display: 'block' }}>
            🔐 비밀번호 수동 보안 변경
          </span>
          <form onSubmit={handlePasswordChangeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input 
              type="password"
              className="text-input"
              style={{ padding: '8px 10px', fontSize: '0.72rem' }}
              placeholder="새 비밀번호 입력 (6자 이상)"
              value={newPasswordInput}
              onChange={(e) => setNewPasswordInput(e.target.value)}
            />
            <input 
              type="password"
              className="text-input"
              style={{ padding: '8px 10px', fontSize: '0.72rem' }}
              placeholder="새 비밀번호 확인 입력"
              value={confirmPasswordInput}
              onChange={(e) => setConfirmPasswordInput(e.target.value)}
            />
            <button
              type="submit"
              className="action-btn action-btn-primary"
              style={{ padding: '8px', fontSize: '0.75rem', fontWeight: '700', marginTop: '2px', border: 'none', borderRadius: '8px' }}
            >
              비밀번호 변경 적용
            </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="mobile-app-layout animate-fade-in" style={{ backgroundColor: 'var(--white)', height: '100%' }}>
      {/* Header */}
      <div className="mobile-header">
        <button 
          onClick={() => onNavigate('feed')} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
          title="뒤로가기"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--neutral-muted)' }}>
            <line x1="19" x2="5" y1="12" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <span className="mobile-logo-text" style={{ flex: 1, marginLeft: '12px', color: 'var(--neutral-dark)' }}>마이페이지</span>
        <button onClick={logout} style={{ fontSize: '0.75rem', color: 'var(--accent-red)', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>
          로그아웃
        </button>
      </div>

      <div className="mobile-content-area" style={{ paddingBottom: '40px' }}>
        
        {/* Profile Card */}
        <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #1a237e 100%)', color: 'white', padding: '16px', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, marginRight: '10px' }}>
              <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '50px' }}>
                구글 SSO 익명 가명 프로필
              </span>
              
              {isEditingNick ? (
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', alignItems: 'center', width: '100%' }}>
                  <input
                    type="text"
                    className="text-input"
                    value={newNick}
                    onChange={(e) => setNewNick(e.target.value)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.8rem',
                      width: '100%',
                      borderRadius: '8px',
                      color: 'var(--neutral-dark)',
                      border: 'none',
                      backgroundColor: 'white'
                    }}
                  />
                  <button 
                    onClick={async () => {
                      const success = await updateUserPseudonym(newNick);
                      if (success) setIsEditingNick(false);
                    }}
                    style={{ fontSize: '0.7rem', color: 'var(--secondary-light)', fontWeight: '700', padding: '4px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px' }}
                  >
                    저장
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditingNick(false);
                      setNewNick(currentUser.pseudonym);
                    }}
                    style={{ fontSize: '0.7rem', color: '#fda4af', fontWeight: '700', padding: '4px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px' }}
                  >
                    취소
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>{currentUser.pseudonym}</h3>
                  <button 
                    onClick={() => {
                      setNewNick(currentUser.pseudonym);
                      setIsEditingNick(true);
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', padding: '2px' }}
                    title="닉네임 수정"
                  >
                    ✏️
                  </button>
                </div>
              )}
              
              <p style={{ fontSize: '0.7rem', opacity: '0.8', marginTop: '4px' }}>
                실명: {currentUser.name} | {currentUser.email}
              </p>
            </div>
            
            <div style={{ background: 'var(--accent-gold)', color: 'white', padding: '6px 12px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: '600' }}>보유 포인트</div>
              <div style={{ fontSize: '0.95rem', fontWeight: '700' }}>{currentUser.points.toLocaleString()}P</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: '12px', paddingTop: '10px', display: 'flex', gap: '16px', fontSize: '0.7rem' }}>
            <div>🏫 {currentUser.schoolName} ({currentUser.grade})</div>
            <div>📍 {currentUser.region}</div>
          </div>
        </div>

        {/* VERIFIED ACADEMY LIST */}
        <div style={{ marginTop: '16px' }}>
          <span className="input-label">🛡️ 영수증으로 인증된 수강 학원 ({currentUser.verifiedAcademy?.length || 0})</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
            {!currentUser.verifiedAcademy || currentUser.verifiedAcademy.length === 0 ? (
              <div style={{ fontSize: '0.7rem', color: 'var(--neutral-muted)', fontStyle: 'italic', background: 'var(--neutral-light)', width: '100%', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                인증된 학원이 없습니다. 영수증을 업로드하여 첫 인증을 받아보세요.
              </div>
            ) : (
              currentUser.verifiedAcademy.map((acad, idx) => (
                <span 
                  key={idx} 
                  className="badge badge-teal" 
                  style={{ padding: '6px 10px', borderRadius: '50px', fontSize: '0.7rem', border: '1px solid var(--secondary)' }}
                >
                  ✔️ {acad}
                </span>
              ))
            )}
          </div>
        </div>

        {/* MY MENU LIST */}
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ borderBottom: '2px solid var(--neutral-light)', paddingBottom: '6px', marginBottom: '4px' }}>
            <span className="input-label" style={{ fontSize: '0.8rem', color: 'var(--neutral-dark)' }}>⚙️ 마이 메뉴 & 개인화 설정</span>
          </div>
          
          <div className="mypage-menu-item" onClick={() => setActiveDrawer('posts')}>
            <span>📝 내가 작성한 커뮤니티 글</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)' }}>➡️</span>
          </div>

          <div className="mypage-menu-item" onClick={() => setActiveDrawer('purchases')}>
            <span>📚 내 구매 자료 내역</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {(currentUser.purchasedPdfs || []).length > 0 && (
                <span style={{ fontSize: '0.62rem', background: 'var(--secondary)', color: 'white', borderRadius: '10px', padding: '1px 6px', fontWeight: '700' }}>
                  {(currentUser.purchasedPdfs || []).length}
                </span>
              )}
              <span style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)' }}>➡️</span>
            </span>
          </div>

          <div className="mypage-menu-item" onClick={() => setActiveDrawer('invite')}>
            <span>✉️ 다른 학부모 초대하기</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)' }}>➡️</span>
          </div>

          <div className="mypage-menu-item" onClick={() => setActiveDrawer('announcements')}>
            <span>📢 서비스 공지사항 & 가이드</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)' }}>➡️</span>
          </div>

          <div className="mypage-menu-item" onClick={() => setActiveDrawer('settings')}>
            <span>⚙️ 테마 / 알림 / 비밀번호 설정</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)' }}>➡️</span>
          </div>
        </div>

      </div>

      {/* PDF Viewer Modal (used from purchases drawer) */}
      {selectedPdf && (
        <AppPdfViewerModal
          pdf={selectedPdf}
          onClose={() => setSelectedPdf(null)}
        />
      )}

      {/* Drawer Overlay Wrapper */}
      {activeDrawer && (
        <div className="mypage-drawer-overlay animate-fade-in" onClick={() => setActiveDrawer(null)}>
          <div className="mypage-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="mypage-drawer-header">
              <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--neutral-dark)' }}>
                {activeDrawer === 'posts' && '📝 내가 작성한 글 목록'}
                {activeDrawer === 'purchases' && '📚 내 구매 자료 내역'}
                {activeDrawer === 'invite' && '✉️ 학부모 초대하기'}
                {activeDrawer === 'announcements' && '📢 서비스 공지사항'}
                {activeDrawer === 'settings' && '⚙️ 서비스 환경 설정'}
              </h4>
              <button 
                onClick={() => setActiveDrawer(null)}
                style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--neutral-muted)', padding: '0 4px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
            
            <div style={{ overflowY: 'auto', maxHeight: '350px', paddingBottom: '10px' }}>
              {activeDrawer === 'posts' && renderMyPosts()}
              {activeDrawer === 'purchases' && renderMyPurchases()}
              {activeDrawer === 'invite' && renderInviteLink()}
              {activeDrawer === 'announcements' && renderAnnouncements()}
              {activeDrawer === 'settings' && renderSettings()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppMyPage;
