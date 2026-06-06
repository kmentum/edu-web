import React, { useContext, useState } from 'react';
import { AppStateContext } from '../../context/AppStateContext';
import { maskPseudonym } from '../../utils/masking';

export const AppFeed = ({ onNavigate, onSelectPost, screenMode }) => {
  const { currentUser, posts, createPost } = useContext(AppStateContext);

  // Tab State: 'school' (우리학교), 'region' (우리동네), 'all' (전체)
  const [activeTab, setActiveTab] = useState('all');
  // Sub-category filter: '전체', '자유', '질문', '리뷰'
  const [activeCategory, setActiveCategory] = useState('전체');

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

    // 2. Synced academic calendar posts should ONLY show in the 'school' tab
    if (post.id.startsWith('post-cal-')) {
      if (activeTab !== 'school') return false;
    }

    // 3. Tab filter
    if (activeTab === 'school') {
      if (isScopeExpanded) {
        // 가변 피드 스코프 확장: 유저 구/군(예: 서초구) 추출 후 동일 구/군 학교 글까지 매핑
        const userDistrict = currentUser.region ? currentUser.region.split(' ')[1] : '';
        const isSameDistrict = userDistrict && post.region && post.region.includes(userDistrict);
        
        if (post.schoolName !== currentUser.schoolName && !isSameDistrict) return false;
        
        // 내 글이거나 노출 범위가 'school' 또는 'all'인 경우 노출
        const isAllowedType = post.type === 'school' || post.type === 'all' || post.authorUid === currentUser.uid;
        if (!isAllowedType) return false;
      } else {
        if (post.schoolName !== currentUser.schoolName) return false;
        
        // 내 글이거나 노출 범위가 'school' 또는 'all'인 경우 노출
        const isAllowedType = post.type === 'school' || post.type === 'all' || post.authorUid === currentUser.uid;
        if (!isAllowedType) return false;
      }
    } else if (activeTab === 'region') {
      if (post.region !== currentUser.region) return false;
      
      // 내 글이거나 노출 범위가 'region' 또는 'all'인 경우 노출
      const isAllowedType = post.type === 'region' || post.type === 'all' || post.authorUid === currentUser.uid;
      if (!isAllowedType) return false;
    } else {
      // 'all' tab shows all public posts or posts marked as 'all'
      if (post.type !== 'all' && post.schoolName !== currentUser.schoolName && post.region !== currentUser.region && post.authorUid !== currentUser.uid) {
        return false; // restrict private posts from showing on national feed if not relevant
      }
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
      {/* Mobile Tabs */}
      <div className="mobile-tabs">
        <button 
          className={`mobile-tab-btn ${activeTab === 'school' ? 'active' : ''}`}
          onClick={() => setActiveTab('school')}
        >
          우리 학교
        </button>
        <button 
          className={`mobile-tab-btn ${activeTab === 'region' ? 'active' : ''}`}
          onClick={() => setActiveTab('region')}
        >
          우리 동네
        </button>
        <button 
          className={`mobile-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          전체 광장
        </button>
      </div>

      {/* Filter Category & Scroll View */}
      <div className="mobile-content-area">
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

        {/* Sub-header text describing boundaries */}
        <div style={{ fontSize: '0.7rem', color: 'var(--neutral-muted)', padding: '0 4px', marginBottom: '2px' }}>
          {activeTab === 'school' && `🏫 ${currentUser.schoolName} 학부모 전용 공간`}
          {activeTab === 'region' && `📍 ${currentUser.region} 주민 소통 공간`}
          {activeTab === 'all' && `🌐 전국 학부모 공유 광장`}
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
                  <div className="stat-item">👍 {post.likes}</div>
                  <div className="stat-item">💬 {post.commentsCount}</div>
                  <div className="stat-item">📁 {post.scraps}</div>
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

      {/* Floating Write Button */}
      <button 
        className="write-floating-btn"
        onClick={() => {
          setWritePostType(activeTab);
          onNavigate('add-post');
        }}
        title="글쓰기"
      >
        ✏️
      </button>
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
        <div style={{ fontSize: '0.65rem', color: 'var(--neutral-muted)', background: 'var(--neutral-bg)', padding: '10px', borderRadius: '8px' }}>
          💡 **팁**: 학원 결제 내역이나 영수증을 인증받은 후 '리뷰' 글을 작성하시면, 닉네임 옆에 **[학원 영수증 인증]** 배지가 달려 글의 신뢰도가 크게 올라갑니다! (영수증 인증은 아래 '영수증' 탭에서 진행)
        </div>
      </div>
    </div>
  );

  return screenMode === 'add-post' ? renderWriteScreen() : renderFeedList();
};
export default AppFeed;
