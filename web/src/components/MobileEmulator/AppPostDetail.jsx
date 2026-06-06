import React, { useContext, useState } from 'react';
import { AppStateContext } from '../../context/AppStateContext';

export const AppPostDetail = ({ postId, onNavigate }) => {
  const { 
    currentUser, 
    posts, 
    comments, 
    addComment, 
    toggleLikePost, 
    toggleScrapPost, 
    reportPost,
    acceptComment,
    votePoll,
    deletePost,
    deleteComment,
    updatePost,
    updateComment,
    togglePostCommentsSubscription,
    toggleLikeComment
  } = useContext(AppStateContext);

  const [commentInput, setCommentInput] = useState('');
  
  // 케밥 메뉴 및 글/댓글 수정 관련 상태
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editTitleInput, setEditTitleInput] = useState('');
  const [editContentInput, setEditContentInput] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentInput, setEditCommentInput] = useState('');
  const [showCommentDropdownId, setShowCommentDropdownId] = useState(null);

  const handleSavePost = async () => {
    if (!editTitleInput.trim() || !editContentInput.trim()) {
      alert('제목과 내용을 모두 입력해 주세요.');
      return;
    }
    const res = await updatePost(post.id, editTitleInput.trim(), editContentInput.trim());
    if (res) {
      if (res.isFlagged) {
        alert('⚠️ AI 필터링 알림:\n입력한 내용 중 부적절하거나 상업성 문구(비속어/부동산 선동/광고)가 포함되어 있어, 수정 즉시 블라인드 처리되었습니다.');
      } else {
        alert('게시글이 성공적으로 수정되었습니다.');
      }
      setIsEditingPost(false);
    }
  };

  const handleSaveComment = async (commentId) => {
    if (!editCommentInput.trim()) return;
    const ok = await updateComment(commentId, editCommentInput.trim());
    if (ok) {
      setEditingCommentId(null);
    }
  };

  if (!currentUser || !postId) return null;

  const post = posts.find(p => p.id === postId);
  if (!post) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>존재하지 않거나 삭제된 게시글입니다.</p>
        <button onClick={() => onNavigate('feed')} className="action-btn action-btn-secondary" style={{ marginTop: '10px' }}>
          목록으로
        </button>
      </div>
    );
  }

  // Filter comments for this post, excluding banned/deleted ones
  const postComments = comments.filter(c => c.postId === postId && !c.isBanned);

  // Checks if the user is the author of this post
  const isPostAuthor = post.authorUid === currentUser.uid;

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addComment(postId, commentInput.trim());
    setCommentInput('');
  };

  const handleReport = () => {
    if (window.confirm('정말로 이 게시글을 신고하시겠습니까?')) {
      reportPost(postId, '부적절한 게시글');
    }
  };

  const handleDeletePost = () => {
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      deletePost(postId);
      alert('게시글이 삭제되었습니다.');
      onNavigate('feed');
    }
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      deleteComment(commentId);
      alert('댓글이 삭제되었습니다.');
    }
  };

  // Poll Vote Calculations
  const getPollTotalVotes = () => {
    if (!post.pollOptions) return 0;
    return post.pollOptions.reduce((acc, opt) => acc + opt.votes, 0);
  };

  const handlePollVote = (optIdx) => {
    votePoll(post.id, optIdx);
  };

  const totalPollVotes = getPollTotalVotes();

  return (
    <div className="mobile-app-layout animate-fade-in" style={{ backgroundColor: 'white', height: '100%', position: 'relative' }}>
      
      {/* Header Bar */}
      <div className="mobile-header">
        <button 
          onClick={() => onNavigate('feed')} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            fontSize: '0.85rem', 
            color: 'var(--neutral-muted)',
            fontWeight: '500'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          목록
        </button>
        <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--neutral-dark)' }}>
          {post.type === 'school' ? '우리 학교' : post.type === 'region' ? '우리 동네' : '전체 광장'}
        </span>
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--neutral-muted)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="5" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
            </svg>
          </button>
          
          {showDropdown && (
            <>
              {/* 투명 백드롭 overlay */}
              <div 
                onClick={() => setShowDropdown(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 99,
                  background: 'none'
                }}
              />
              
              {/* 드롭다운 하위 메뉴 */}
              <div 
                style={{
                  position: 'absolute',
                  top: '32px',
                  right: '0px',
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                  border: '1px solid #f1f5f9',
                  padding: '4px',
                  minWidth: '100px',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}
              >
                {isPostAuthor ? (
                  <>
                    <button 
                      onClick={() => {
                        setShowDropdown(false);
                        setIsEditingPost(true);
                        setEditTitleInput(post.title);
                        setEditContentInput(post.content);
                      }}
                      style={{
                        padding: '8px 12px',
                        border: 'none',
                        background: 'none',
                        textAlign: 'left',
                        fontSize: '0.78rem',
                        fontWeight: '600',
                        color: 'var(--neutral-dark)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
                      onMouseLeave={(e) => e.target.style.background = 'none'}
                    >
                      수정하기
                    </button>
                    <button 
                      onClick={() => {
                        setShowDropdown(false);
                        handleDeletePost();
                      }}
                      style={{
                        padding: '8px 12px',
                        border: 'none',
                        background: 'none',
                        textAlign: 'left',
                        fontSize: '0.78rem',
                        fontWeight: '600',
                        color: 'var(--accent-red)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#fff5f5'}
                      onMouseLeave={(e) => e.target.style.background = 'none'}
                    >
                      삭제하기
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => {
                      setShowDropdown(false);
                      handleReport();
                    }}
                    style={{
                      padding: '8px 12px',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      color: 'var(--accent-red)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      width: '100%',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#fff5f5'}
                    onMouseLeave={(e) => e.target.style.background = 'none'}
                  >
                    신고하기
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="post-detail-screen">
        {isEditingPost ? (
          /* 인라인 글 수정 폼 */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px 14px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', margin: '10px 0' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '800', margin: '0 0 4px', color: 'var(--neutral-dark)' }}>게시글 수정</h3>
            <div>
              <label style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--neutral-muted)', display: 'block', marginBottom: '4px' }}>제목</label>
              <input 
                type="text" 
                value={editTitleInput}
                onChange={(e) => setEditTitleInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#f8fafc'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--neutral-muted)', display: 'block', marginBottom: '4px' }}>본문 내용</label>
              <textarea 
                value={editContentInput}
                onChange={(e) => setEditContentInput(e.target.value)}
                rows={8}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.8rem',
                  outline: 'none',
                  resize: 'none',
                  boxSizing: 'border-box',
                  background: '#f8fafc',
                  fontFamily: 'inherit',
                  lineHeight: '1.4'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button 
                onClick={() => setIsEditingPost(false)}
                className="action-btn action-btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.75rem', minHeight: 'auto', borderRadius: '8px' }}
              >
                취소
              </button>
              <button 
                onClick={handleSavePost}
                className="action-btn action-btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.75rem', minHeight: 'auto', borderRadius: '8px' }}
              >
                저장
              </button>
            </div>
          </div>
        ) : (
          /* 기존 포스트 뷰어 (상세 본문 및 액션 버튼들) */
          <>
            {/* Post Meta */}
            <div className="post-card-header" style={{ marginBottom: '8px' }}>
              <div className="post-meta-left">
                <span className={`badge ${post.category === '자유' ? 'badge-indigo' : post.category === '질문' ? 'badge-gold' : 'badge-teal'}`}>
                  {post.category}
                </span>
                <span className="post-author">{post.authorName}</span>
              </div>
              <span className="post-date">
                {new Date(post.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Post Title */}
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--neutral-dark)', marginBottom: '8px' }}>
              {post.isAiFlaged && <span className="badge badge-red" style={{ marginRight: '6px', fontSize: '0.7rem' }}>블라인드</span>}
              {post.title}
              {post.qnaPoints > 0 && <span className="qna-point-badge" style={{ marginLeft: '6px' }}>{post.qnaPoints}P 채택</span>}
            </h2>

            {/* Scope tags (채널 뱃지는 상단 헤더로 이동, 영수증 뱃지만 남김) */}
            {post.hasReceiptBadge && (
              <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                <span className="badge badge-green">학원 영수증 인증완료</span>
              </div>
            )}

            {/* Content Body / Flag check */}
            <div className="post-detail-body">
              {post.isAiFlaged ? (
                <div>
                  <div style={{ filter: 'blur(5px)', userSelect: 'none', padding: '12px', background: '#fff1f2', borderRadius: '8px' }}>
                    {post.content}
                  </div>
                  <div className="blocked-content-banner">
                    AI 및 누적 신고에 의해 블라인드 처리된 글입니다.<br/>
                    <span style={{ fontSize: '0.7rem', opacity: '0.8' }}>({post.aiFlagReason || '신고 누적으로 임시 비공개'})</span>
                    <p style={{ fontSize: '0.65rem', marginTop: '6px', color: 'var(--neutral-muted)' }}>
                      * 우측 관리자 대시보드의 [콘텐츠 관리] 탭에서 내용을 모니터링하고 복구할 수 있습니다.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="post-detail-content" style={{ whiteSpace: 'pre-wrap' }}>{post.content}</div>
              )}

              {/* Interactive Poll */}
              {post.pollOptions && !post.isAiFlaged && (
                <div style={{ marginTop: '16px', padding: '14px', background: 'var(--neutral-light)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>익명 투표</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: '400', color: 'var(--neutral-muted)' }}>총 {totalPollVotes}표</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {post.pollOptions.map((opt, idx) => {
                      const hasVoted = opt.votedUids.includes(currentUser.uid);
                      const percent = totalPollVotes > 0 ? Math.round((opt.votes / totalPollVotes) * 100) : 0;
                      
                      return (
                        <button 
                          key={idx}
                          onClick={() => handlePollVote(idx)}
                          style={{
                            position: 'relative',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            background: hasVoted ? 'var(--primary-light)' : 'var(--white)',
                            border: hasVoted ? '1px solid var(--primary)' : '1px solid var(--neutral-light)',
                            textAlign: 'left',
                            fontSize: '0.75rem',
                            outline: 'none',
                            overflow: 'hidden',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            zIndex: '1',
                            cursor: 'pointer'
                          }}
                        >
                          {/* Percent background bar */}
                          <div 
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: `${percent}%`,
                              height: '100%',
                              background: hasVoted ? 'rgba(63, 81, 181, 0.15)' : 'rgba(0, 0, 0, 0.03)',
                              zIndex: '-1',
                              transition: 'width 0.4s ease'
                            }}
                          />
                          <span style={{ fontWeight: hasVoted ? '700' : '400' }}>
                            {hasVoted ? '✓ ' : ''}{opt.text}
                          </span>
                          <span style={{ fontWeight: '600', color: 'var(--neutral-muted)' }}>
                            {opt.votes}표 ({percent}%)
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Engagement Buttons & 댓글 알림 토글 스위치 */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '20px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    className={`stat-btn ${post.likedBy.includes(currentUser.uid) ? 'active' : ''}`}
                    onClick={() => toggleLikePost(post.id)}
                    style={{ fontSize: '0.8rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill={post.likedBy.includes(currentUser.uid) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                    </svg>
                    <span>좋아요 {post.likes}</span>
                  </button>
                  <button 
                    className="stat-btn"
                    onClick={() => {
                      const el = document.querySelector('.comment-list-title');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    style={{ fontSize: '0.8rem', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>댓글 {postComments.length}</span>
                  </button>
                </div>

                {/* 댓글 알림 구독 스위치 */}
                {(() => {
                  const subs = post.subscribedUids || [post.authorUid];
                  const isSubscribed = subs.includes(currentUser.uid);
                  return (
                    <button
                      onClick={() => togglePostCommentsSubscription(post.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: '1px solid #cbd5e1',
                        background: isSubscribed ? 'var(--primary-light)' : 'white',
                        borderColor: isSubscribed ? 'var(--primary)' : '#cbd5e1',
                        borderRadius: '20px',
                        padding: '5px 12px',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        color: isSubscribed ? 'var(--primary)' : 'var(--neutral-muted)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        outline: 'none'
                      }}
                      title={isSubscribed ? '댓글 알림 끄기' : '댓글 알림 켜기'}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill={isSubscribed ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                      </svg>
                      <span>{isSubscribed ? '댓글 알림 켬' : '댓글 알림 끔'}</span>
                    </button>
                  );
                })()}
              </div>
            </div>
          </>
        )}

        {/* Comment Title */}
        {!isEditingPost && (
          <>
            <div className="comment-list-title" style={{ fontSize: '0.82rem', fontWeight: '800', margin: '24px 0 10px', paddingBottom: '4px', color: 'var(--neutral-dark)' }}>
              댓글 목록
            </div>

            {/* Comments Area */}
            <div className="comments-container">
              {postComments.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--neutral-muted)', fontSize: '0.75rem', padding: '16px 0' }}>
                  작성된 댓글이 없습니다. 첫 댓글을 남겨보세요.
                </p>
              ) : (
                postComments.map(comment => (
                  <div 
                    key={comment.id} 
                    className={`comment-item ${comment.isAccepted ? 'accepted' : ''}`}
                  >
                    <div className="comment-header">
                      <span className="comment-author">
                        {comment.authorName}
                        {comment.authorUid === post.authorUid && <span className="badge badge-indigo" style={{ fontSize: '0.55rem', padding: '1px 3px', marginLeft: '4px' }}>작성자</span>}
                      </span>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="post-date" style={{ fontSize: '0.65rem' }}>
                          {new Date(comment.createdAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        
                        {/* Accept Answer Option for Q&A Author */}
                        {post.category === '질문' && !post.qnaResolved && isPostAuthor && comment.authorUid !== currentUser.uid && (
                          <button 
                            type="button"
                            onClick={() => acceptComment(post.id, comment.id)}
                            className="badge badge-gold" 
                            style={{ cursor: 'pointer', border: '1px solid var(--accent-gold)' }}
                          >
                            채택하기
                          </button>
                        )}

                        {/* Accepted badge indicator */}
                        {comment.isAccepted && (
                          <span className="badge badge-green">채택된 답변</span>
                        )}

                        {/* Delete & Edit options inside Meatball Menu */}
                        {comment.authorUid === currentUser.uid && (
                          <div className="comment-meatball-container">
                            <button 
                              type="button"
                              className="comment-meatball-btn"
                              onClick={() => setShowCommentDropdownId(showCommentDropdownId === comment.id ? null : comment.id)}
                              style={{ outline: 'none' }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="1.5" />
                                <circle cx="5" cy="12" r="1.5" />
                                <circle cx="19" cy="12" r="1.5" />
                              </svg>
                            </button>
                            
                            {showCommentDropdownId === comment.id && (
                              <>
                                {/* Backdrop Overlay */}
                                <div 
                                  onClick={() => setShowCommentDropdownId(null)}
                                  style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    zIndex: 99,
                                    background: 'none'
                                  }}
                                />
                                
                                <div className="comment-dropdown">
                                  <button 
                                    type="button"
                                    className="comment-dropdown-btn edit"
                                    onClick={() => {
                                      setShowCommentDropdownId(null);
                                      setEditingCommentId(comment.id);
                                      setEditCommentInput(comment.content);
                                    }}
                                  >
                                    수정
                                  </button>
                                  <button 
                                    type="button"
                                    className="comment-dropdown-btn delete"
                                    onClick={() => {
                                      setShowCommentDropdownId(null);
                                      handleDeleteComment(comment.id);
                                    }}
                                  >
                                    삭제
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {editingCommentId === comment.id ? (
                      <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <input 
                          type="text" 
                          value={editCommentInput}
                          onChange={(e) => setEditCommentInput(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.78rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                          autoFocus
                        />
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button 
                            type="button"
                            onClick={() => setEditingCommentId(null)}
                            style={{ border: 'none', background: '#e2e8f0', borderRadius: '4px', padding: '3px 8px', fontSize: '0.65rem', fontWeight: '700', cursor: 'pointer' }}
                          >
                            취소
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleSaveComment(comment.id)}
                            style={{ border: 'none', background: 'var(--primary)', color: 'white', borderRadius: '4px', padding: '3px 8px', fontSize: '0.65rem', fontWeight: '700', cursor: 'pointer' }}
                          >
                            수정 완료
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="comment-content">{comment.content}</div>
                        <div className="comment-actions">
                          <button 
                            type="button"
                            className={`comment-like-btn ${(comment.likedBy || []).includes(currentUser.uid) ? 'active' : ''}`}
                            onClick={() => toggleLikeComment(comment.id)}
                            style={{ outline: 'none' }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill={(comment.likedBy || []).includes(currentUser.uid) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                            </svg>
                            <span>좋아요 {comment.likes || 0}</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Bottom Comment Box */}
      <form className="bottom-comment-bar" onSubmit={handleSendComment}>
        <input 
          type="text" 
          className="comment-input" 
          placeholder="따뜻한 댓글을 남겨주세요"
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
        />
        <button type="submit" className="comment-submit-btn">
          등록
        </button>
      </form>
    </div>
  );
};
export default AppPostDetail;
