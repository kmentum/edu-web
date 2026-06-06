import React, { useContext, useState, useEffect, useRef } from 'react';
import { AppStateContext } from '../../context/AppStateContext';
import { maskPseudonym } from '../../utils/masking';

export const AppFeed = ({ onNavigate, onSelectPost, screenMode }) => {
  const { 
    currentUser, 
    posts, 
    createPost, 
    activeTab, 
    setActiveTab, 
    showNotifDropdown, 
    setShowNotifDropdown, 
    notifications, 
    markNotificationsAsRead,
    lastTabVisited,
    triggerRefresh
  } = useContext(AppStateContext);

  // Sub-category filter: '전체', '자유', '질문', '리뷰'
  const [activeCategory, setActiveCategory] = useState('전체');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollTopRef = useRef(0);

  // --- Pull-to-Refresh & Swipe Tabs Gesture States (ref 기반) ---
  const [pullDisplayDist, setPullDisplayDist] = useState(0); // 렌더링용
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartYRef = useRef(0);
  const touchStartXRef = useRef(0);
  const isPullingRef = useRef(false);
  const pullDistRef = useRef(0);
  const isRefreshingRef = useRef(false);
  const THRESHOLD = 60; // 새로고침 발동 임계치(px)

  const handleTouchStart = (e) => {
    if (isRefreshingRef.current) return;
    const scrollTop = e.currentTarget.scrollTop;
    
    touchStartYRef.current = e.touches[0].clientY;
    touchStartXRef.current = e.touches[0].clientX;
    pullDistRef.current = 0;

    if (scrollTop <= 0) {
      isPullingRef.current = true;
    } else {
      isPullingRef.current = false;
    }
  };

  const handleTouchMove = (e) => {
    if (isRefreshingRef.current) return;
    
    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const diffY = currentY - touchStartYRef.current;
    const diffX = currentX - touchStartXRef.current;

    // Y축 드래그가 지배적이고 아래로 당길 때만 pull-to-refresh로 판단
    if (Math.abs(diffY) > Math.abs(diffX)) {
      if (isPullingRef.current && diffY > 0) {
        const dist = Math.min(Math.pow(diffY, 0.75) * 2.5, 80);
        pullDistRef.current = dist;
        setPullDisplayDist(dist);
        if (diffY > 8 && e.cancelable) e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async (e) => {
    const currentY = e.changedTouches[0].clientY;
    const currentX = e.changedTouches[0].clientX;
    const diffY = currentY - touchStartYRef.current;
    const diffX = currentX - touchStartXRef.current;
    
    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);

    // 1. 좌우 스와이프 제스처 처리 (X축 지배적이고 70px 이상 이동한 경우)
    if (absX > absY && absX > 70) {
      const tabs = ['school', 'region', 'all'];
      const currentIndex = tabs.indexOf(activeTab);

      if (diffX > 0) {
        // 오른쪽 스와이프 -> 이전 탭(왼쪽 채널)으로
        if (currentIndex > 0) {
          setActiveTab(tabs[currentIndex - 1]);
        }
      } else {
        // 왼쪽 스와이프 -> 다음 탭(오른쪽 채널)으로
        if (currentIndex < tabs.length - 1) {
          setActiveTab(tabs[currentIndex + 1]);
        }
      }

      // 제스처가 탭 전환으로 소비되었으므로 pull-to-refresh 초기화 후 반환
      isPullingRef.current = false;
      pullDistRef.current = 0;
      setPullDisplayDist(0);
      return;
    }

    // 2. 세로 당겨서 새로고침(Pull-to-Refresh) 처리
    if (!isPullingRef.current) return;
    isPullingRef.current = false;
    const dist = pullDistRef.current;

    if (dist >= THRESHOLD) {
      isRefreshingRef.current = true;
      setIsRefreshing(true);
      setPullDisplayDist(THRESHOLD);
      try {
        await triggerRefresh();
      } catch (err) {
        console.error('Refresh error:', err);
      } finally {
        setTimeout(() => {
          isRefreshingRef.current = false;
          setIsRefreshing(false);
          setPullDisplayDist(0);
          pullDistRef.current = 0;
        }, 700);
      }
    } else {
      setPullDisplayDist(0);
      pullDistRef.current = 0;
    }
  };

  const hasNewPost = (tab) => {
    if (activeTab === tab) return false;
    if (!lastTabVisited || !lastTabVisited[tab]) return false;

    const visitedTime = lastTabVisited[tab];

    return posts.some(post => {
      if (post.isBanned) return false;
      const isCalPost = post.id.startsWith('post-cal-');
      
      if (tab === 'school') {
        return (post.type === 'school' || isCalPost) && 
               post.schoolName === currentUser.schoolName && 
               new Date(post.createdAt).getTime() > visitedTime;
      }
      if (tab === 'region') {
        return post.type === 'region' && 
               post.region === currentUser.region && 
               new Date(post.createdAt).getTime() > visitedTime;
      }
      if (tab === 'all') {
        return post.type === 'all' && 
               new Date(post.createdAt).getTime() > visitedTime;
      }
      return false;
    });
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const lastScrollTop = lastScrollTopRef.current;
    
    // 모바일 스크롤 바운스 시 음수 또는 최대 스크롤 영역 초과 이벤트 무시
    if (scrollTop < 0 || scrollTop + clientHeight > scrollHeight) {
      return;
    }

    // 맨 아래 도달 50px 전부터는 헤더 가시성을 변경하지 않음 (헤더 변화로 인한 높이 싱크 무한루프 방지)
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      lastScrollTopRef.current = scrollTop;
      return;
    }
    
    if (scrollTop <= 10) {
      setShowHeader(true);
    } else if (scrollTop > lastScrollTop && scrollTop > 50) {
      setShowHeader(false);
    } else if (scrollTop < lastScrollTop) {
      setShowHeader(true);
    }
    
    lastScrollTopRef.current = scrollTop;
  };

  useEffect(() => {
    if (screenMode === 'add-post') {
      setWritePostType(activeTab);
    }
  }, [screenMode, activeTab]);

  // Add post states (for write screen)
  const [writeTitle, setWriteTitle] = useState('');
  const [writeContent, setWriteContent] = useState('');
  const [writeCategory, setWriteCategory] = useState('자유');
  const [writePostType, setWritePostType] = useState('all'); // 'school', 'region', 'all'
  const [writeQnaPoints, setWriteQnaPoints] = useState(0);
  
  // Poll option states
  const [hasPoll, setHasPoll] = useState(false);
  const [pollOpts, setPollOpts] = useState(['', '']);

  if (!currentUser) return null;

  // UTIL-03.1: 가변형 피드 스코프 계산 (우리 학교 탭의 실제 글 개수가 3개 미만이면 구/군 소속 학교 소식 병합)
  const schoolPostsCount = posts.filter(post => 
    !post.isBanned && 
    post.schoolName === currentUser.schoolName && 
    post.type === 'school'
  ).length;

  const isScopeExpanded = activeTab === 'school' && schoolPostsCount < 3;

  // Filter posts based on: 1) Active Tab, 2) Category sub-filter, 3) not deleted by Admin (isBanned === false)
  const filteredPosts = posts.filter(post => {
    // 1. Ban status
    if (post.isBanned) return false;

    // Search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchTitle = post.title && post.title.toLowerCase().includes(query);
      const matchContent = post.content && post.content.toLowerCase().includes(query);
      if (!matchTitle && !matchContent) return false;
    }

    // 2. Synced academic calendar posts should ONLY show in the 'school' tab
    if (post.id.startsWith('post-cal-')) {
      if (activeTab !== 'school') return false;
    }

    // 3. Tab filter
    if (activeTab === 'school') {
      const isCalendarPost = post.id.startsWith('post-cal-');
      if (!isCalendarPost && post.type !== 'school') return false;

      if (isScopeExpanded) {
        // 가변 피드 스코프 확장: 유저 구/군(예: 서초구) 추출 후 동일 구/군 학교 글까지 매핑
        const userDistrict = currentUser.region ? currentUser.region.split(' ')[1] : '';
        const isSameDistrict = userDistrict && post.region && post.region.includes(userDistrict);
        
        if (post.schoolName !== currentUser.schoolName && !isSameDistrict) return false;
      } else {
        if (post.schoolName !== currentUser.schoolName) return false;
      }
    } else if (activeTab === 'region') {
      if (post.type !== 'region') return false;
      if (post.region !== currentUser.region) return false;
    } else if (activeTab === 'all') {
      if (post.type !== 'all') return false;
    }

    // 4. Category filter
    if (activeCategory !== '전체') {
      if (post.category !== activeCategory) return false;
    }

    return true;
  });

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!writeTitle.trim() || !writeContent.trim()) {
      alert('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    const options = {};
    if (writeCategory === '질문' && writeQnaPoints > 0) {
      options.qnaPoints = writeQnaPoints;
      if (currentUser.points < writeQnaPoints) {
        alert('보유하신 포인트가 설정한 채택 포인트보다 부족합니다.');
        return;
      }
    }

    if (hasPoll) {
      const activeOptions = pollOpts.filter(opt => opt.trim() !== '');
      if (activeOptions.length < 2) {
        alert('투표 항목을 2개 이상 입력해 주세요.');
        return;
      }
      options.pollOptions = activeOptions;
    }

    // Create post
    const newPost = createPost(writeTitle, writeContent, writeCategory, writePostType, options);
    
    if (newPost) {
      if (newPost.isAiFlaged) {
        alert('⚠️ AI 필터링 알림:\n입력한 내용 중 부적절하거나 상업성 문구(비속어/부동산 선동/광고)가 포함되어 있어, 등록 즉시 블라인드 처리되었습니다. 우측 관리자 대시보드에서 승인 후 복구 가능합니다.');
      } else {
        alert('게시글이 정상 등록되었습니다.');
      }
      
      // Reset forms
      setWriteTitle('');
      setWriteContent('');
      setWriteCategory('자유');
      setWritePostType('all');
      setWriteQnaPoints(0);
      setHasPoll(false);
      setPollOpts(['', '']);

      onNavigate('feed');
    }
  };

  const handleAddPollOption = () => {
    if (pollOpts.length >= 5) {
      alert('투표 항목은 최대 5개까지만 지원합니다.');
      return;
    }
    setPollOpts([...pollOpts, '']);
  };

  const handlePollOptChange = (index, val) => {
    const next = [...pollOpts];
    next[index] = val;
    setPollOpts(next);
  };

  // Rendering of Main Feed List Screen
  const renderFeedList = () => (
    <div className="mobile-app-layout animate-fade-in" style={{ height: '100%' }}>
      <div className={`feed-header-group ${showHeader ? 'show' : 'hide'}`}>
        {/* Header with Search, Notif, MyPage */}
        <div className="mobile-header">
        {isSearchExpanded ? (
          <div className="search-bar-container" style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--neutral-muted)' }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" />
            </svg>
            <input 
              type="text" 
              placeholder="글 제목, 내용 검색..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '0.85rem',
                color: 'var(--neutral-dark)',
                padding: '4px 0'
              }}
              autoFocus
            />
            <button 
              onClick={() => { setIsSearchExpanded(false); setSearchQuery(''); }}
              style={{ background: 'none', border: 'none', fontSize: '1rem', color: 'var(--neutral-muted)', cursor: 'pointer', padding: '0 4px' }}
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <span className="mobile-logo-text">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle', color: '#64748b' }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              커뮤니티
            </span>
            <div className="mobile-header-actions">
              <button 
                onClick={() => setIsSearchExpanded(true)}
                className="header-icon-btn"
                title="검색"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" x2="16.65" y1="21" y2="16.65" />
                </svg>
              </button>
              <button 
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  markNotificationsAsRead();
                }}
                className="header-icon-btn"
                style={{ position: 'relative' }}
                title="푸시 알림 내역"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                {notifications.filter(n => n.unread).length > 0 && (
                  <span className="notif-badge-dot" />
                )}
              </button>
              <button 
                onClick={() => onNavigate('mypage')}
                className="header-icon-btn"
                title="마이페이지"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile Tabs */}
      <div className="mobile-tabs">
        <button 
          className={`mobile-tab-btn ${activeTab === 'school' ? 'active' : ''}`}
          onClick={() => setActiveTab('school')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}
        >
          우리 학교
          {hasNewPost('school') && <span className="tab-new-badge">N</span>}
        </button>
        <button 
          className={`mobile-tab-btn ${activeTab === 'region' ? 'active' : ''}`}
          onClick={() => setActiveTab('region')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}
        >
          우리 동네
          {hasNewPost('region') && <span className="tab-new-badge">N</span>}
        </button>
        <button 
          className={`mobile-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}
        >
          전체 광장
          {hasNewPost('all') && <span className="tab-new-badge">N</span>}
        </button>
      </div>
      </div>

      {/* Filter Category & Scroll View */}
      <div 
        className="mobile-content-area" 
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pull-to-Refresh Indicator */}
        {(pullDisplayDist > 0 || isRefreshing) && (() => {
          const progress = Math.min(pullDisplayDist / THRESHOLD, 1);
          // SVG 도넛바 파라미터
          const r = 14;
          const circ = 2 * Math.PI * r;
          const dashOffset = circ * (1 - (isRefreshing ? 1 : progress));
          return (
            <div
              className="ptr-indicator"
              style={{
                height: isRefreshing ? `${THRESHOLD}px` : `${pullDisplayDist}px`,
                transition: isPullingRef.current ? 'none' : 'height 0.28s ease',
                paddingBottom: pullDisplayDist > 15 ? '6px' : '0px',
              }}
            >
              {/* 도넛 프로그레스 원 */}
              <svg
                width="34" height="34"
                style={{
                  transform: isRefreshing ? undefined : `rotate(${-90 + progress * 360}deg)`,
                  animation: isRefreshing ? 'spinDonut 0.8s linear infinite' : undefined,
                  opacity: Math.min(pullDisplayDist / 20, 1),
                }}
                viewBox="0 0 36 36"
              >
                {/* 배경 트랙 */}
                <circle
                  cx="18" cy="18" r={r}
                  fill="none"
                  className="ptr-svg-track"
                  strokeWidth="3"
                />
                {/* 진행 Arc */}
                <circle
                  cx="18" cy="18" r={r}
                  fill="none"
                  stroke={progress >= 1 || isRefreshing ? 'var(--primary)' : '#94a3b8'}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${circ}`}
                  strokeDashoffset={isRefreshing ? 0 : dashOffset}
                  transform="rotate(-90 18 18)"
                  style={{ transition: isPullingRef.current ? 'none' : 'stroke-dashoffset 0.1s' }}
                />
              </svg>
              <span className="ptr-text" style={{ opacity: Math.min(pullDisplayDist / 30, 1) }}>
                {isRefreshing ? '새로고침 중...' : progress >= 1 ? '놓으면 새로고침' : '당겨서 새로고침'}
              </span>
            </div>
          );
        })()}

        {/* Category Badges */}
        <div className="feed-filter-bar">
          {['전체', '자유', '질문', '리뷰'].map(cat => (
            <button 
              key={cat}
              className={`filter-badge ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>



        {/* Scope expansion notice banner (UTIL-03.1) */}
        {isScopeExpanded && (
          <div className="scope-expansion-banner animate-fade-in">
            📢 우리 학교 글이 부족하여 인근 <strong>{currentUser.region ? currentUser.region.split(' ')[1] || '지역' : '지역'}</strong> 소식을 함께 노출합니다.
          </div>
        )}

        {/* Post cards list */}
        {filteredPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--neutral-muted)', fontSize: '0.8rem' }}>
            등록된 게시글이 없습니다. 첫 글을 작성해 보세요!
          </div>
        ) : (
          filteredPosts.map(post => (
            <div 
              key={post.id} 
              className="post-card animate-slide-up"
              onClick={() => {
                onSelectPost(post.id);
                onNavigate('post-detail');
              }}
            >
              <div className="post-card-header">
                <div className="post-meta-left">
                  <span className={`badge ${post.category === '자유' ? 'badge-indigo' : post.category === '질문' ? 'badge-gold' : 'badge-teal'}`}>
                    {post.category}
                  </span>
                  {/* RSK-03: 전국 탭일 때만 법정동 지역명 마스킹 처리 */}
                  <span className="post-author">
                    {activeTab === 'all' ? maskPseudonym(post.authorName) : post.authorName}
                  </span>
                </div>
                <span className="post-date">
                  {new Date(post.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                </span>
              </div>

              {/* Title */}
              <div className="post-title">
                {post.isAiFlaged && <span className="badge badge-red" style={{ marginRight: '6px', fontSize: '0.65rem' }}>차단됨</span>}
                {post.title}
                {post.qnaPoints > 0 && <span className="qna-point-badge" style={{ marginLeft: '6px' }}>💎 {post.qnaPoints}P</span>}
              </div>

              {/* Snippet / Blurr if flagged */}
              {post.isAiFlaged ? (
                <div className="post-snippet" style={{ filter: 'blur(3px)', userSelect: 'none', color: 'var(--accent-red)' }}>
                  부적절한 내용 감지로 비공개 처리되었습니다.
                </div>
              ) : (
                <div className="post-snippet">{post.content}</div>
              )}

              <div className="post-card-footer">
                <div className="post-stats">
                  <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#64748b' }}>
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                    </svg>
                    <span>{post.likes}</span>
                  </div>
                  <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#64748b' }}>
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>{post.commentsCount}</span>
                  </div>
                  <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#64748b' }}>
                      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                    </svg>
                    <span>{post.scraps}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '4px' }}>
                  {post.hasReceiptBadge && <span className="badge badge-teal" style={{fontSize: '0.65rem'}}>📜 학원 영수증 인증</span>}
                  {post.type === 'school' && <span className="badge badge-indigo" style={{fontSize: '0.65rem'}}>학교</span>}
                  {post.type === 'region' && <span className="badge badge-teal" style={{fontSize: '0.65rem'}}>동네</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Rendering of Write Post Screen
  const renderWriteScreen = () => (
    <div className="mobile-app-layout animate-slide-up" style={{ backgroundColor: 'white', height: '100%' }}>
      {/* Mini Top Bar */}
      <div className="mobile-header">
        <button onClick={() => onNavigate('feed')} style={{ fontSize: '0.85rem', color: 'var(--neutral-muted)' }}>
          취소
        </button>
        <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>게시글 작성</span>
        <button onClick={handleCreatePost} style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.85rem' }}>
          등록
        </button>
      </div>

      <div className="add-post-screen">
        {/* Category Choice */}
        <div className="input-group">
          <label className="input-label">카테고리</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['자유', '질문', '리뷰'].map(cat => (
              <button 
                type="button"
                key={cat}
                className={`filter-badge ${writeCategory === cat ? 'active' : ''}`}
                style={{ flex: 1, textAlign: 'center' }}
                onClick={() => {
                  setWriteCategory(cat);
                  // Auto set post scope if Review
                  if (cat === '리뷰') {
                    setWritePostType('region');
                  }
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Scope Choice */}
        <div className="input-group">
          <label className="input-label">게시글 노출 범위</label>
          <select 
            className="text-input"
            value={writePostType}
            onChange={(e) => setWritePostType(e.target.value)}
            disabled={writeCategory === '리뷰'}
          >
            <option value="all">전체 (전국 학부모)</option>
            <option value="school">우리 학교 ({currentUser.schoolName})</option>
            <option value="region">우리 동네 ({currentUser.region})</option>
          </select>
          {writeCategory === '리뷰' && (
            <span style={{ fontSize: '0.65rem', color: 'var(--neutral-muted)', marginTop: '2px' }}>
              * 리뷰 카테고리는 동네/지역 커뮤니티 노출이 권장되어 "우리 동네"로 고정됩니다.
            </span>
          )}
        </div>

        {/* Q&A points helper */}
        {writeCategory === '질문' && (
          <div className="input-group animate-slide-up" style={{ backgroundColor: 'var(--accent-gold-light)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.2)' }}>
            <label className="input-label" style={{ color: 'var(--accent-gold)' }}>🎁 Q&A 채택 포인트 설정</label>
            <select
              className="qna-point-select"
              style={{ marginTop: '6px' }}
              value={writeQnaPoints}
              onChange={(e) => setWriteQnaPoints(parseInt(e.target.value))}
            >
              <option value="0">설정 안 함 (0P)</option>
              <option value="100">100P</option>
              <option value="200">200P</option>
              <option value="500">500P</option>
              <option value="1000">1000P</option>
            </select>
            <span style={{ fontSize: '0.65rem', color: 'var(--neutral-text)', marginTop: '4px' }}>
              * 답변자가 채택되면 설정된 포인트가 지급됩니다. (보유 포인트: {currentUser.points}P)
            </span>
          </div>
        )}

        {/* Title */}
        <div className="input-group">
          <label className="input-label" htmlFor="write-title">제목</label>
          <input 
            id="write-title"
            type="text"
            className="text-input"
            placeholder="제목을 입력하세요"
            value={writeTitle}
            onChange={(e) => setWriteTitle(e.target.value)}
          />
        </div>

        {/* Content */}
        <div className="input-group" style={{ flex: 1, minHeight: '120px' }}>
          <label className="input-label" htmlFor="write-content">내용</label>
          <textarea 
            id="write-content"
            className="text-input"
            style={{ flex: 1, resize: 'none', padding: '12px' }}
            placeholder="학부모들과 소통할 내용을 작성해 보세요.&#10;(단어 '광고', '선동', '바보', '쓰레기' 등은 AI 필터 테스트용 키워드입니다.)"
            value={writeContent}
            onChange={(e) => setWriteContent(e.target.value)}
          />
        </div>

        {/* Toggle Poll */}
        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="input-label">📊 익명 투표 올리기</label>
            <input 
              type="checkbox" 
              checked={hasPoll} 
              onChange={(e) => setHasPoll(e.target.checked)} 
              style={{ width: '16px', height: '16px' }}
            />
          </div>

          {hasPoll && (
            <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', padding: '10px', background: 'var(--neutral-light)', borderRadius: '8px' }}>
              {pollOpts.map((opt, idx) => (
                <input 
                  key={idx}
                  type="text"
                  className="text-input"
                  style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                  placeholder={`항목 ${idx + 1}`}
                  value={opt}
                  onChange={(e) => handlePollOptChange(idx, e.target.value)}
                />
              ))}
              <button 
                type="button" 
                onClick={handleAddPollOption}
                className="action-btn action-btn-secondary"
                style={{ fontSize: '0.7rem', padding: '4px', margin: '4px 0 0' }}
              >
                + 항목 추가
              </button>
            </div>
          )}
        </div>

        {/* Tip banner */}
        <div style={{ fontSize: '0.65rem', color: 'var(--neutral-muted)', background: 'var(--neutral-bg)', padding: '8px 10px', borderRadius: '8px' }}>
          💡 영수증 인증 후 리뷰를 작성하면 신뢰 배지가 달립니다.
        </div>
      </div>
    </div>
  );

  return screenMode === 'add-post' ? renderWriteScreen() : renderFeedList();
};
export default AppFeed;
