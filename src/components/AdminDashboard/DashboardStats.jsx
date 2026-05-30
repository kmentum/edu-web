import React, { useContext } from 'react';
import { AppStateContext } from '../../context/AppStateContext';

export const DashboardStats = () => {
  const { users, posts, receipts } = useContext(AppStateContext);

  // Statistics Computations
  const totalUsers = users.length;
  const activePosts = posts.filter(p => !p.isBanned).length;
  const totalReports = posts.reduce((acc, p) => acc + (p.reports || 0), 0);
  const pendingReceipts = receipts.filter(r => r.status === 'pending').length;

  // Compile real-time activity feed based on current state
  const recentActivities = [];

  // Add receipts activities
  receipts.forEach(r => {
    recentActivities.push({
      time: new Date(r.createdAt || Date.now()),
      text: `🧾 [영수증제출] ${r.userPseudonym}님이 '${r.academyName}' 영수증 검증을 요청했습니다.`,
      status: r.status === 'approved' ? '승인완료' : r.status === 'rejected' ? '반려됨' : '대기중'
    });
  });

  // Add flagged posts activities
  posts.filter(p => p.isAiFlaged).forEach(p => {
    recentActivities.push({
      time: new Date(p.createdAt),
      text: `⚠️ [AI 필터링] ${p.authorName}님의 게시글 '${p.title.substring(0,15)}...'이 자동 블라인드 처리되었습니다.`,
      status: '검토대기'
    });
  });

  // Sort activities by time descending
  const sortedActivities = recentActivities
    .sort((a, b) => b.time - a.time)
    .slice(0, 5);

  return (
    <div className="animate-fade-in">
      {/* Stats Cards Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-card-title">총 가입 학부모</span>
          <div className="stat-card-value">👥 {totalUsers}명</div>
          <span style={{ fontSize: '0.65rem', color: 'var(--accent-green)', fontWeight: '600' }}>
            ↑ 구글 SSO 계정 100% 매핑
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-card-title">활성 커뮤니티 글</span>
          <div className="stat-card-value">📝 {activePosts}개</div>
          <span style={{ fontSize: '0.65rem', color: 'var(--neutral-muted)' }}>
            격리 필터링 100% 작동 중
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-card-title">사용자 신고 접수</span>
          <div className="stat-card-value">🚨 {totalReports}건</div>
          <span style={{ fontSize: '0.65rem', color: 'var(--accent-red)', fontWeight: '600' }}>
            * 3회 누적 시 자동 가려짐
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-card-title">미결 영수증 대기</span>
          <div className="stat-card-value" style={{ color: pendingReceipts > 0 ? 'var(--accent-gold)' : '' }}>
            🧾 {pendingReceipts}건
          </div>
          <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '600' }}>
            * 검증 대기 중인 OCR 영수증
          </span>
        </div>
      </div>

      {/* Main Stats Panel split layouts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* Quick Help Guide */}
        <div className="admin-table-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px' }}>
            📢 관리자 대시보드 실시간 놀이터 사용 가이드
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--neutral-text)', lineHeight: '1.6' }}>
            이 환경은 <strong>Split-Screen Interactive Playground</strong>입니다. 좌측의 모바일 폰 에뮬레이터에서 이루어지는 모든 행위는 
            우측 관리자 패널에 100% 실시간 동기화되어 반영됩니다. 아래의 시나리오를 자유롭게 조작하며 기능을 검증해보실 수 있습니다:
          </p>
          
          <ul style={{ fontSize: '0.78rem', color: 'var(--neutral-muted)', marginLeft: '20px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>
              <strong>1. AI 비속어 차단 및 복구</strong>: 좌측 앱에서 '바보', '광고', '선동' 등의 글자를 넣어 글을 써보세요. 
              등록 즉시 앱에서 블라인드 처리되며, 우측 <strong>[콘텐츠 관리]</strong> 메뉴에서 해당 로그가 노출되어 복구 또는 영구 삭제할 수 있습니다.
            </li>
            <li>
              <strong>2. 영수증 OCR 승인 & 배지 지급</strong>: 좌측 앱 <strong>'영수증'</strong> 탭에서 템플릿 영수증을 선택해 올려보세요. 
              우측 <strong>[영수증 검증]</strong> 탭에 즉시 OCR 텍스트 대조 내역이 뜨며, '승인' 클릭 시 좌측 모바일 회원의 포인트가 가산되고 
              글작성 시 '영수증 인증 배지'가 자동으로 달립니다.
            </li>
            <li>
              <strong>3. 악성 회원 차단(Ban) 연동</strong>: 우측 <strong>[회원 관리]</strong> 탭에서 특정 사용자를 '차단'해 보세요. 
              좌측 모바일 에뮬레이터에서 해당 유저가 강제 로그아웃 조치되며 접근이 실시간 차단됩니다.
            </li>
            <li>
              <strong>4. 학사일정 댓글 및 실시간 알림 (V2)</strong>: 좌측 앱 <strong>'학사일정'</strong>에서 일정을 누르고 <code>🔔 알림 구독</code> 후 댓글을 남겨보세요. 
              2.5초 뒤 다른 학부모가 답글을 남기는 시뮬레이션이 발동되어 폰 상단에 푸시 알림 배너가 스르륵 내려오고 종 배지에 불이 들어옵니다. 
              이 댓글들은 우측 <strong>[학사 일정 댓글 통제]</strong> 메뉴에서 실시간으로 강제 블라인드 하거나 살릴 수 있습니다.
            </li>
          </ul>
        </div>

        {/* Real-time Activity Feed */}
        <div className="admin-table-card">
          <div className="table-header">
            <h3>⚡ 실시간 최근 이벤트</h3>
          </div>
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sortedActivities.length === 0 ? (
              <p style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', textAlign: 'center', padding: '20px 0' }}>
                최근 발생한 기록이 없습니다.
              </p>
            ) : (
              sortedActivities.map((act, index) => (
                <div 
                  key={index}
                  style={{
                    borderBottom: '1px solid var(--neutral-light)',
                    paddingBottom: '8px',
                    fontSize: '0.73rem',
                    lineHeight: '1.4'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--neutral-muted)', fontSize: '0.65rem', marginBottom: '2px' }}>
                    <span>{act.time.toLocaleTimeString('ko-KR')}</span>
                    <span className="badge badge-indigo" style={{ fontSize: '0.55rem', padding: '1px 3px' }}>{act.status}</span>
                  </div>
                  <div style={{ fontWeight: '500', color: 'var(--neutral-dark)' }}>{act.text}</div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
export default DashboardStats;
