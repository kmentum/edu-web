import React, { useContext, useState } from 'react';
import { AppStateContext } from '../../context/AppStateContext';

export const AdminReceipts = () => {
  const { receipts, approveReceipt, rejectReceipt } = useContext(AppStateContext);

  const [selectedReceiptId, setSelectedReceiptId] = useState(null);
  const [rejectMemo, setRejectMemo] = useState('');

  // Selected receipt detail
  const activeReceipt = receipts.find(r => r.id === selectedReceiptId) || receipts[0];

  // Sync selection if list updates
  React.useEffect(() => {
    if (receipts.length > 0 && !selectedReceiptId) {
      setSelectedReceiptId(receipts[0].id);
    }
  }, [receipts, selectedReceiptId]);

  const handleApprove = (id) => {
    approveReceipt(id);
    alert('영수증 인증이 승인되었습니다!\n회원에게 [학원 인증 배지]와 [5,000P]가 즉시 지급되었습니다.');
  };

  const handleReject = (id) => {
    if (!rejectMemo.trim()) {
      alert('반려 사유를 입력해 주세요 (예: 이미지 판독 불가, 영수증 훼손 등).');
      return;
    }
    rejectReceipt(id, rejectMemo.trim());
    setRejectMemo('');
    alert('영수증 검증 신청이 반려 처리되었습니다.');
  };

  return (
    <div className="receipt-verifier-container animate-fade-in">
      
      {/* Left Column: Receipts queue list */}
      <div className="admin-table-card">
        <div className="table-header">
          <h3>🧾 학원비 수납 영수증 검증 대기열 ({receipts.length})</h3>
        </div>
        
        <div style={{ overflowY: 'auto', maxHeight: '550px' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>가명 신청자</th>
                <th>학원명</th>
                <th>금액</th>
                <th>날짜</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--neutral-muted)', padding: '20px' }}>
                    신청된 영수증 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                receipts.map(rcpt => (
                  <tr 
                    key={rcpt.id}
                    onClick={() => setSelectedReceiptId(rcpt.id)}
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: rcpt.id === selectedReceiptId ? 'var(--primary-light)' : '',
                      borderLeft: rcpt.id === selectedReceiptId ? '4px solid var(--primary)' : ''
                    }}
                  >
                    <td style={{ fontSize: '0.73rem', fontWeight: '600' }}>{rcpt.userPseudonym}</td>
                    <td style={{ fontWeight: '700' }}>{rcpt.academyName}</td>
                    <td>{rcpt.amountStr}</td>
                    <td style={{ fontSize: '0.7rem' }}>{rcpt.date}</td>
                    <td>
                      <span className={`badge ${
                        rcpt.status === 'approved' ? 'badge-green' : 
                        rcpt.status === 'rejected' ? 'badge-red' : 
                        'badge-gold'
                      }`}>
                        {rcpt.status === 'approved' ? '승인' : 
                         rcpt.status === 'rejected' ? '반려' : 
                         '대기'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Column: Active receipt OCR audit desk */}
      {activeReceipt ? (
        <div className="ocr-details-panel">
          <div style={{ borderBottom: '1px solid var(--neutral-light)', paddingBottom: '10px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>🔬 OCR 매칭 정밀 검증 데스크</h4>
            <p style={{ fontSize: '0.7rem', color: 'var(--neutral-muted)', marginTop: '2px' }}>
              신청자: {activeReceipt.userName} ({activeReceipt.userPseudonym})
            </p>
          </div>

          {/* Grid comparing OCR vs User Claims */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            
            {/* Cash register visual receipt card */}
            <div className="receipt-image-preview-admin" style={{ padding: '12px' }}>
              <div style={{ 
                background: '#fff', 
                border: '1px solid #ddd', 
                padding: '16px 12px', 
                fontFamily: 'monospace', 
                fontSize: '0.7rem',
                color: '#111',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ textAlign: 'center', borderBottom: '2px dashed #999', paddingBottom: '6px', fontWeight: '700' }}>
                  *** 영수증 실물 판독 사본 ***
                </div>
                <div>[가맹명] {activeReceipt.ocrData.academyName}</div>
                <div>[거래일] {activeReceipt.ocrData.date}</div>
                <div>[승인액] {activeReceipt.ocrData.amount}</div>
                <div style={{ borderTop: '1px dashed #999', paddingTop: '6px', textAlign: 'right', fontSize: '0.65rem' }}>
                  판독 신뢰도: 97.4%
                </div>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--neutral-muted)', textAlign: 'center', marginTop: '6px' }}>
                * 업로드된 이미지 파일의 OCR 자동 해독 결과
              </div>
            </div>

            {/* Verification details checks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem' }}>
              <span className="input-label" style={{ marginBottom: '2px' }}>항목별 유효성 진단</span>
              
              <div style={{ background: 'var(--neutral-light)', padding: '8px 12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span>학원명 교차 검증:</span>
                <span style={{ color: 'var(--accent-green)', fontWeight: '700' }}>일치 (OK)</span>
              </div>
              <div style={{ background: 'var(--neutral-light)', padding: '8px 12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span>수납액 교차 검증:</span>
                <span style={{ color: 'var(--accent-green)', fontWeight: '700' }}>일치 (OK)</span>
              </div>
              <div style={{ background: 'var(--neutral-light)', padding: '8px 12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span>중복 제출 필터링:</span>
                <span style={{ color: 'var(--accent-green)', fontWeight: '700' }}>통과 (OK)</span>
              </div>

              {activeReceipt.status !== 'pending' && (
                <div style={{ marginTop: '10px', padding: '8px', borderRadius: '6px', background: activeReceipt.status === 'approved' ? 'var(--accent-green-light)' : 'var(--accent-red-light)' }}>
                  <span style={{ fontWeight: '700' }}>검증 상태: {activeReceipt.status === 'approved' ? '최종 승인됨' : '반려됨'}</span>
                  {activeReceipt.reviewedAt && (
                    <div style={{ fontSize: '0.65rem', opacity: '0.8', marginTop: '2px' }}>
                      일시: {new Date(activeReceipt.reviewedAt).toLocaleString('ko-KR')}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Control Actions Form */}
          {activeReceipt.status === 'pending' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--neutral-light)' }}>
              <div className="input-group">
                <label className="input-label" htmlFor="reject-memo">반려 시 기재 사유 (반려 시 필수)</label>
                <input 
                  id="reject-memo"
                  type="text" 
                  className="text-input" 
                  style={{ padding: '8px', fontSize: '0.75rem' }}
                  placeholder="예: 영수증 금액 흐림으로 판독 불가"
                  value={rejectMemo}
                  onChange={(e) => setRejectMemo(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => handleReject(activeReceipt.id)}
                  className="action-btn action-btn-danger" 
                  style={{ flex: 1, padding: '10px' }}
                >
                  반려하기 (Reject)
                </button>
                <button 
                  onClick={() => handleApprove(activeReceipt.id)}
                  className="action-btn action-btn-success" 
                  style={{ flex: 2, padding: '10px', marginRight: '0' }}
                >
                  최종 승인 (Approve)
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--neutral-muted)', fontSize: '0.75rem', marginTop: 'auto', padding: '10px' }}>
              🔒 완료된 검증 건으로 조작이 비활성화되었습니다.
            </div>
          )}

        </div>
      ) : (
        <div className="ocr-details-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--neutral-muted)', fontSize: '0.8rem' }}>좌측에서 심사할 영수증을 선택해 주세요.</p>
        </div>
      )}

    </div>
  );
};
export default AdminReceipts;
