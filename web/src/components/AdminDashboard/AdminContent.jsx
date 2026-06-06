import React, { useContext } from 'react';
import { AppStateContext } from '../../context/AppStateContext';

export const AdminContent = () => {
  const { posts, deletePost, restorePost } = useContext(AppStateContext);

  // Filter posts that are either flagged by AI, reported by users, or are banned/deleted
  const flaggedPosts = posts.filter(p => p.isAiFlaged || p.reports > 0 || p.isBanned);

  const handleDelete = (postId) => {
    if (window.confirm('이 게시글을 영구 삭제하시겠습니까? 앱 화면에서 즉시 삭제됩니다.')) {
      deletePost(postId);
      alert('게시글이 삭제 처리되었습니다.');
    }
  };

  const handleRestore = (postId) => {
    restorePost(postId);
    alert('게시글이 블라인드에서 정상 복구되었습니다. 앱 화면에 다시 공개됩니다.');
  };

  return (
    <div className="admin-table-card animate-fade-in">
      <div className="table-header">
        <h3>🚨 위험 게시글 모니터링 및 신고 누적 처리</h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)' }}>
          AI 필터링 감지 또는 학부모 누적 신고 게시물 실시간 대시보드
        </span>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>카테고리</th>
            <th>가명 작성자</th>
            <th>게시글 제목</th>
            <th>필터링 원인 / 사유</th>
            <th>신고수</th>
            <th>내용 원본 확인 (관리자 모니터링)</th>
            <th>상태</th>
            <th>조치</th>
          </tr>
        </thead>
        <tbody>
          {flaggedPosts.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center', color: 'var(--neutral-muted)', padding: '30px' }}>
                검토 대기 중인 신고글이나 차단된 유해 콘텐츠가 없습니다. 깨끗한 피드 유지 중입니다! ✨
              </td>
            </tr>
          ) : (
            flaggedPosts.map(post => (
              <tr key={post.id} style={{ backgroundColor: post.isBanned ? '#f1f5f9' : post.isAiFlaged ? '#fff1f2' : '' }}>
                <td>
                  <span className={`badge ${post.category === '자유' ? 'badge-indigo' : post.category === '질문' ? 'badge-gold' : 'badge-teal'}`}>
                    {post.category}
                  </span>
                </td>
                <td style={{ fontSize: '0.75rem', fontWeight: '600' }}>{post.authorName}</td>
                <td style={{ fontWeight: '700' }}>{post.title}</td>
                <td style={{ color: 'var(--accent-red)', fontSize: '0.72rem', fontWeight: '500' }}>
                  {post.isBanned ? '관리자가 수동 삭제' : post.aiFlagReason || '사용자 신고 접수'}
                </td>
                <td style={{ fontWeight: '700', color: post.reports >= 3 ? 'var(--accent-red)' : '' }}>
                  🚨 {post.reports}회
                </td>
                <td>
                  <div style={{ 
                    maxHeight: '60px', 
                    maxWidth: '300px', 
                    overflowY: 'auto', 
                    fontSize: '0.72rem', 
                    whiteSpace: 'pre-wrap', 
                    background: '#fafafa', 
                    padding: '6px', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '4px',
                    fontFamily: 'monospace'
                  }}>
                    {post.content}
                  </div>
                </td>
                <td>
                  {post.isBanned ? (
                    <span className="badge badge-indigo">삭제 완료</span>
                  ) : post.isAiFlaged ? (
                    <span className="badge badge-red">블라인드 (비공개)</span>
                  ) : (
                    <span className="badge badge-green">정상 노출</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {!post.isBanned && (
                      <button 
                        onClick={() => handleDelete(post.id)}
                        className="action-btn action-btn-danger"
                        style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                      >
                        영구삭제
                      </button>
                    )}
                    {(post.isAiFlaged || post.isBanned || post.reports > 0) && (
                      <button 
                        onClick={() => handleRestore(post.id)}
                        className="action-btn action-btn-success"
                        style={{ padding: '4px 8px', fontSize: '0.7rem', marginRight: '0' }}
                      >
                        복구/해제
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
export default AdminContent;
