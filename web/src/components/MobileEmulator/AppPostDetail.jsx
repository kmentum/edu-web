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
    votePoll
  } = useContext(AppStateContext);

  const [commentInput, setCommentInput] = useState('');

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

  // Filter comments for this post
  const postComments = comments.filter(c => c.postId === postId);

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
        <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>게시글 상세</span>
        <button 
          onClick={handleReport} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            fontSize: '0.8rem', 
            color: 'var(--accent-red)', 
            fontWeight: '600' 
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
            <line x1="4" y1="22" x2="4" y2="15"></line>
          </svg>
          신고
        </button>
      </div>

      <div className="post-detail-screen">
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
          {post.qnaPoints > 0 && <span className="qna-point-badge" style={{ marginLeft: '6px' }}>💎 {post.qnaPoints}P 채택</span>}
        </h2>

        {/* Scope tags */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
          {post.type === 'school' && <span className="badge badge-indigo">우리학교 단독</span>}
          {post.type === 'region' && <span className="badge badge-teal">우리동네 단독</span>}
          {post.type === 'all' && <span className="badge badge-indigo">전국 광장</span>}
          {post.hasReceiptBadge && <span className="badge badge-green">📜 학원 영수증 인증완료</span>}
        </div>

        {/* Content Body / Flag check */}
        <div className="post-detail-body">
          {post.isAiFlaged ? (
            <div>
              <div style={{ filter: 'blur(5px)', userSelect: 'none', padding: '12px', background: '#fff1f2', borderRadius: '8px' }}>
                {post.content}
              </div>
              <div className="blocked-content-banner">
                ⚠️ AI 및 누적 신고에 의해 블라인드 처리된 글입니다.<br/>
                <span style={{ fontSize: '0.7rem', opacity: '0.8' }}>({post.aiFlagReason || '신고 누적으로 임시 비공개'})</span>
                <p style={{ fontSize: '0.65rem', marginTop: '6px', color: 'var(--neutral-muted)' }}>
                  * 우측 관리자 대시보드의 [콘텐츠 관리] 탭에서 내용을 모니터링하고 복구할 수 있습니다.
                </p>
              </div>
            </div>
          ) : (
            <div className="post-detail-content">{post.content}</div>
          )}

          {/* Interactive Poll */}
          {post.pollOptions && !post.isAiFlaged && (
            <div style={{ marginTop: '16px', padding: '14px', background: 'var(--neutral-light)', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span>📊 익명 투표</span>
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
                        overflow: 'hidden',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        zIndex: '1'
                      }}
                    >
                      {/* Percent background bar */}
                      <div 
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          height: '100%',
                          width: `${percent}%`,
                          background: hasVoted ? 'rgba(63, 81, 181, 0.15)' : 'rgba(0, 0, 0, 0.03)',
                          zIndex: '-1',
                          transition: 'width 0.4s ease'
                        }}
                      />
                      <span style={{ fontWeight: hasVoted ? '700' : '400' }}>
                        {hasVoted ? '✔️ ' : ''}{opt.text}
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

          {/* Engagement Buttons */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
            <button 
              className={`stat-btn ${post.likedBy.includes(currentUser.uid) ? 'active' : ''}`}
              onClick={() => toggleLikePost(post.id)}
              style={{ fontSize: '0.8rem', fontWeight: '500' }}
            >
              👍 좋아요 {post.likes}
            </button>
            <button 
              className={`stat-btn ${post.scrapedBy.includes(currentUser.uid) ? 'active' : ''}`}
              onClick={() => toggleScrapPost(post.id)}
              style={{ fontSize: '0.8rem', fontWeight: '500', color: post.scrapedBy.includes(currentUser.uid) ? 'var(--secondary)' : '' }}
            >
              📁 스크랩 {post.scraps}
            </button>
          </div>
        </div>

        {/* Comment Title */}
        <div className="comment-list-title">댓글 ({postComments.length})</div>

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
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="post-date" style={{ fontSize: '0.65rem' }}>
                      {new Date(comment.createdAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    
                    {/* Accept Answer Option for Q&A Author */}
                    {post.category === '질문' && !post.qnaResolved && isPostAuthor && comment.authorUid !== currentUser.uid && (
                      <button 
                        onClick={() => acceptComment(post.id, comment.id)}
                        className="badge badge-gold" 
                        style={{ cursor: 'pointer', border: '1px solid var(--accent-gold)' }}
                      >
                        채택하기
                      </button>
                    )}

                    {/* Accepted badge indicator */}
                    {comment.isAccepted && (
                      <span className="badge badge-green">✔️ 채택됨 답변</span>
                    )}
                  </div>
                </div>
                <div className="comment-content">{comment.content}</div>
              </div>
            ))
          )}
        </div>
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
