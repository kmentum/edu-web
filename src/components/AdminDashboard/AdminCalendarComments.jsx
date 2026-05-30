import React, { useContext, useState } from 'react';
import { AppStateContext } from '../../context/AppStateContext';

export const AdminCalendarComments = () => {
  const { calendarComments, deleteCalendarComment, restoreCalendarComment } = useContext(AppStateContext);

  const [schoolFilter, setSchoolFilter] = useState('전체');
  const [statusFilter, setStatusFilter] = useState('전체');

  // Filter Comments based on table controls
  const filteredComments = calendarComments.filter(comment => {
    // School Filter
    if (schoolFilter !== '전체' && comment.schoolName !== schoolFilter) return false;
    
    // Status Filter
    if (statusFilter === 'active' && comment.isBanned) return false;
    if (statusFilter === 'deleted' && !comment.isBanned) return false;

    return true;
  });

  const handleDeleteComment = (commentId) => {
    if (window.confirm('이 학사일정 댓글을 블라인드(삭제) 처리하시겠습니까? 좌측 폰 기기에서 실시간으로 가려집니다.')) {
      deleteCalendarComment(commentId);
      alert('댓글이 차단 처리되었습니다.');
    }
  };

  const handleRestoreComment = (commentId) => {
    restoreCalendarComment(commentId);
    alert('댓글이 정상 복구되어 모바일 피드에 다시 공개됩니다.');
  };

  const schoolOptions = ['전체', '서울반포초등학교', '서울대치초등학교', '부산센텀초등학교', '서울대청중학교'];

  return (
    <div className="admin-table-card animate-fade-in">
      
      {/* Table Action Controls */}
      <div className="table-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <h3>🏫 학사일정 대화방 실시간 모니터링 (MNG-04)</h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--neutral-muted)' }}>
            특정 시험/행사 일정 대화방의 저격 비방, 악성 도배글 실시간 통제
          </span>
        </div>

        {/* Filter controls row */}
        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <label className="input-label">학교 필터링</label>
            <select 
              className="text-input" 
              style={{ padding: '6px 10px', fontSize: '0.8rem' }}
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
            >
              {schoolOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="input-group" style={{ flex: 1 }}>
            <label className="input-label">이용 상태 필터링</label>
            <select 
              className="text-input" 
              style={{ padding: '6px 10px', fontSize: '0.8rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="전체">전체 상태 보기</option>
              <option value="active">정상 노출 댓글</option>
              <option value="deleted">차단(블라인드) 댓글</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Database Table */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>학교명</th>
            <th>학사 일정 정보</th>
            <th>가명 작성자</th>
            <th>자녀 학년</th>
            <th>댓글 대화 내용</th>
            <th>작성 시간</th>
            <th>이용 상태</th>
            <th>조치</th>
          </tr>
        </thead>
        <tbody>
          {filteredComments.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center', color: 'var(--neutral-muted)', padding: '30px' }}>
                조건에 맞는 학사 일정 댓글 기록이 없습니다.
              </td>
            </tr>
          ) : (
            filteredComments.map(comment => {
              // Extract event title mapping
              let displayEventTitle = comment.postId === 'post-cal-cal-bp-04' ? '1학기 과정 중심 평가' : '학사 일정';

              return (
                <tr 
                  key={comment.id}
                  style={{
                    backgroundColor: comment.isBanned ? '#fff1f2' : '',
                    opacity: comment.isBanned ? '0.7' : '1'
                  }}
                >
                  <td style={{ fontSize: '0.75rem', fontWeight: '500' }}>{comment.schoolName}</td>
                  <td>
                    <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>
                      {displayEventTitle}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.75rem', fontWeight: '600' }}>{comment.authorName}</td>
                  <td>
                    <span className="badge badge-teal" style={{ fontSize: '0.62rem' }}>
                      {comment.grade}
                    </span>
                  </td>
                  <td style={{ maxWidth: '280px', fontWeight: '500' }}>
                    <div style={{ wordBreak: 'break-all', fontSize: '0.78rem' }}>
                      {comment.content}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.7rem', color: 'var(--neutral-muted)' }}>
                    {new Date(comment.createdAt).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>
                    {comment.isBanned ? (
                      <span className="badge badge-red">차단됨 (숨김)</span>
                    ) : (
                      <span className="badge badge-green">정상 노출</span>
                    )}
                  </td>
                  <td>
                    {comment.isBanned ? (
                      <button 
                        onClick={() => handleRestoreComment(comment.id)}
                        className="action-btn action-btn-success"
                        style={{ padding: '4px 8px', fontSize: '0.68rem', marginRight: '0' }}
                      >
                        차단 복구
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="action-btn action-btn-danger"
                        style={{ padding: '4px 8px', fontSize: '0.68rem', marginRight: '0' }}
                      >
                        강제 차단
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

    </div>
  );
};
export default AdminCalendarComments;
