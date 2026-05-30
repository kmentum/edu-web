import React, { useContext, useState } from 'react';
import { AppStateContext } from '../../context/AppStateContext';

export const AdminUsers = () => {
  const { users, banUser, unbanUser, updateUserGrade, updateUserPoints } = useContext(AppStateContext);

  const [pointsInput, setPointsInput] = useState({}); // points offset per user

  const handlePointsChange = (uid, val) => {
    setPointsInput(prev => ({ ...prev, [uid]: val }));
  };

  const handleApplyPoints = (uid) => {
    const amount = parseInt(pointsInput[uid]);
    if (isNaN(amount) || amount === 0) {
      alert('올바른 포인트 액수를 입력해 주세요.');
      return;
    }
    updateUserPoints(uid, amount);
    setPointsInput(prev => ({ ...prev, [uid]: '' }));
    alert(`포인트가 ${amount > 0 ? '+' : ''}${amount}P 적용되었습니다.`);
  };

  const handleToggleBan = (user) => {
    if (user.isBanned) {
      unbanUser(user.uid);
      alert(`${user.name}님의 계정 정지가 해제되었습니다.`);
    } else {
      if (window.confirm(`${user.name} (${user.pseudonym}) 계정을 영구 차단하시겠습니까? 좌측 에뮬레이터에서 해당 유저 로그인 시 즉시 로그아웃 차단됩니다.`)) {
        banUser(user.uid);
        alert(`${user.name}님이 차단 처리되었습니다.`);
      }
    }
  };

  const handleGradeChange = (uid, newGrade) => {
    updateUserGrade(uid, newGrade);
    alert(`자녀 학년이 ${newGrade}(으)로 수동 수정되었습니다.`);
  };

  return (
    <div className="admin-table-card animate-fade-in">
      <div className="table-header">
        <h3>👥 서비스 가입 회원 및 학과 권한 관리</h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)' }}>
          가입된 구글 SSO 계정 리스트 및 학년에 대한 관리 권한 제공
        </span>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>구글실명 (이메일)</th>
            <th>생성 가명 닉네임</th>
            <th>설정 지역</th>
            <th>설정 학교명</th>
            <th>자녀 학년 수정</th>
            <th>보유 포인트</th>
            <th>포인트 지급/차감</th>
            <th>이용 상태 (제재)</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.uid} style={{ opacity: user.isBanned ? '0.6' : '1', backgroundColor: user.isBanned ? '#fff1f2' : '' }}>
              <td>
                <div style={{ fontWeight: '700' }}>{user.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--neutral-muted)' }}>{user.email}</div>
              </td>
              <td>
                <span className="badge badge-indigo" style={{ padding: '4px 8px', borderRadius: '50px' }}>
                  {user.pseudonym || '가입대기'}
                </span>
              </td>
              <td>{user.region || '-'}</td>
              <td>{user.schoolName || '-'}</td>
              <td>
                {user.schoolName ? (
                  <select 
                    value={user.grade}
                    className="text-input"
                    style={{ padding: '4px 8px', fontSize: '0.75rem', width: '90px' }}
                    onChange={(e) => handleGradeChange(user.uid, e.target.value)}
                  >
                    <option value="1학년">1학년</option>
                    <option value="2학년">2학년</option>
                    <option value="3학년">3학년</option>
                    <option value="4학년">4학년</option>
                    <option value="5학년">5학년</option>
                    <option value="6학년">6학년</option>
                  </select>
                ) : (
                  <span style={{ color: 'var(--neutral-muted)', fontSize: '0.75rem' }}>미입력</span>
                )}
              </td>
              <td style={{ fontWeight: '700', color: 'var(--secondary)' }}>
                {user.points.toLocaleString()}P
              </td>
              <td>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <input 
                    type="number"
                    className="text-input"
                    style={{ width: '70px', padding: '4px 6px', fontSize: '0.75rem' }}
                    placeholder="+/- 500"
                    value={pointsInput[user.uid] || ''}
                    onChange={(e) => handlePointsChange(user.uid, e.target.value)}
                  />
                  <button 
                    onClick={() => handleApplyPoints(user.uid)}
                    className="action-btn action-btn-primary" 
                    style={{ padding: '4px 8px', fontSize: '0.7rem', marginRight: '0' }}
                  >
                    적용
                  </button>
                </div>
              </td>
              <td>
                <button 
                  onClick={() => handleToggleBan(user)}
                  className={`action-btn ${user.isBanned ? 'action-btn-success' : 'action-btn-danger'}`}
                  style={{ width: '80px', textAlign: 'center' }}
                >
                  {user.isBanned ? '정지 해제' : '영구 정지'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default AdminUsers;
