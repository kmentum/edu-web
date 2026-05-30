import React, { useContext, useState, useEffect } from 'react';
import { AppStateContext } from '../../context/AppStateContext';
import { mockReceiptTemplates } from '../../data/receiptData';

export const AppReceiptAuth = ({ onNavigate }) => {
  const { receipts, currentUser, submitReceipt } = useContext(AppStateContext);

  // States
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customAcademyName, setCustomAcademyName] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0); // 0: idle, 1: scanning, 2: scan complete
  
  const [ocrResults, setOcrResults] = useState(null);

  if (!currentUser) return null;

  // Filter user's own receipts
  const myReceipts = receipts.filter(r => r.userUid === currentUser.uid);

  // Trigger Mock OCR animation
  const startMockOCR = (preset = null) => {
    setIsScanning(true);
    setScanStep(1);
    setOcrResults(null);

    // Timeline for scanning animation
    setTimeout(() => {
      // Completed scanning after 2.2 seconds
      setIsScanning(false);
      setScanStep(2);

      if (preset) {
        setOcrResults({
          academyName: preset.academyName,
          date: preset.date,
          amountStr: preset.amountStr,
          confidence: preset.ocrConfidence,
          templateId: preset.id
        });
      } else {
        // Custom values
        setOcrResults({
          academyName: customAcademyName || '대치동 영재수학학원',
          date: customDate || new Date().toISOString().split('T')[0],
          amountStr: customAmount ? parseInt(customAmount).toLocaleString() + '원' : '280,000원',
          confidence: '89% (수동 업로드 검증 필요)',
          templateId: 'custom'
        });
      }
    }, 2200);
  };

  const handleSelectPreset = (preset) => {
    setSelectedTemplate(preset);
    startMockOCR(preset);
  };

  const handleCustomUploadSubmit = (e) => {
    e.preventDefault();
    if (!customAcademyName.trim() || !customDate || !customAmount) {
      alert('학원명, 결제일자, 결제 금액을 입력해주세요.');
      return;
    }
    setSelectedTemplate(null);
    startMockOCR();
  };

  const handleFinalSubmit = () => {
    if (!ocrResults) return;

    submitReceipt(
      ocrResults.academyName,
      ocrResults.date,
      ocrResults.amountStr,
      ocrResults.templateId
    );

    // Reset
    setScanStep(0);
    setOcrResults(null);
    setCustomAcademyName('');
    setCustomDate('');
    setCustomAmount('');
    setSelectedTemplate(null);
  };

  return (
    <div className="mobile-app-layout animate-fade-in" style={{ backgroundColor: 'white', height: '100%' }}>
      {/* Header */}
      <div className="mobile-header">
        <span className="mobile-logo-text">📜 학원 영수증 인증</span>
        <span className="points-pill">💎 {currentUser.points}P</span>
      </div>

      <div className="mobile-content-area" style={{ paddingBottom: '30px' }}>
        
        {scanStep === 0 && (
          <>
            <div style={{ padding: '4px', textAlign: 'center', marginBottom: '8px' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                학원 영수증이나 학원 앱 수강증을 인증하고<br/>
                <span style={{ color: 'var(--secondary)', fontWeight: '700' }}>'인증된 학부모' 배지</span>와 <span style={{ color: 'var(--primary)', fontWeight: '700' }}>5,000 포인트</span>를 받으세요!
              </p>
            </div>

            {/* PRESETS CHOICE (Option 1) */}
            <div className="input-group">
              <span className="input-label">테스트용 영수증 템플릿 선택 (원클릭 OCR)</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                {mockReceiptTemplates.map(preset => (
                  <button 
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className="auth-google-btn"
                    style={{ padding: '8px 12px' }}
                  >
                    <div style={{ flex: 1, fontSize: '0.75rem' }}>
                      <div style={{ fontWeight: '700' }}>{preset.name}</div>
                      <div style={{ color: 'var(--neutral-muted)', fontSize: '0.65rem', marginTop: '2px' }}>
                        검증대상: {preset.academyName} | {preset.amountStr}
                      </div>
                    </div>
                    <span className="badge badge-teal">선택</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="auth-divider">또는 직접 수동 정보 입력 (Option 2)</div>

            {/* CUSTOM INPUT (Option 2) */}
            <form onSubmit={handleCustomUploadSubmit} className="auth-custom-form" style={{ gap: '10px' }}>
              <div className="input-group">
                <label className="input-label">학원명</label>
                <input 
                  type="text" 
                  className="text-input" 
                  style={{ padding: '8px' }}
                  placeholder="예: 해법수학 대치교실"
                  value={customAcademyName}
                  onChange={(e) => setCustomAcademyName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="input-group">
                  <label className="input-label">결제일자</label>
                  <input 
                    type="date" 
                    className="text-input" 
                    style={{ padding: '8px' }}
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">결제 금액 (원)</label>
                  <input 
                    type="number" 
                    className="text-input" 
                    style={{ padding: '8px' }}
                    placeholder="250000"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn" style={{ padding: '8px', fontSize: '0.75rem' }}>
                영수증 사진 업로드 & OCR 판독 시뮬레이션
              </button>
            </form>

            {/* MY RECEIPTS STATUS LIST */}
            <div style={{ marginTop: '20px' }}>
              <span className="input-label">내 영수증 인증 내역 ({myReceipts.length})</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                {myReceipts.map(rcpt => (
                  <div 
                    key={rcpt.id}
                    style={{
                      background: 'var(--white)',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--neutral-light)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.75rem'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700' }}>{rcpt.academyName}</div>
                      <div style={{ color: 'var(--neutral-muted)', fontSize: '0.65rem' }}>
                        {rcpt.amountStr} | {new Date(rcpt.createdAt).toLocaleDateString('ko-KR')}
                      </div>
                      {rcpt.reviewerMemo && (
                        <div style={{ color: 'var(--neutral-muted)', fontSize: '0.6rem', marginTop: '4px', fontStyle: 'italic' }}>
                          * 비고: {rcpt.reviewerMemo}
                        </div>
                      )}
                    </div>

                    <span className={`badge ${
                      rcpt.status === 'approved' ? 'badge-green' : 
                      rcpt.status === 'rejected' ? 'badge-red' : 
                      'badge-gold'
                    }`}>
                      {rcpt.status === 'approved' ? '승인완료 (+5,000P)' : 
                       rcpt.status === 'rejected' ? '반려됨' : 
                       '검토중'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* SCANNING SCREEN (Animation) */}
        {scanStep === 1 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 10px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '4px' }}>AI OCR 영수증 판독 중...</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', marginBottom: '16px' }}>
              영수증 이미지에서 텍스트 정보를 해독하고 있습니다.
            </p>

            <div className="ocr-scanner-visual">
              {/* The sliding green laser scan bar */}
              <div className="ocr-scanning-laser" />
              
              <div className="receipt-preview-img-mock">
                <div>
                  <div style={{ fontWeight: '700', borderBottom: '1px solid #111', paddingBottom: '4px', marginBottom: '8px' }}>
                    [RECEIPT / 🧾]
                  </div>
                  <div>가맹점: {selectedTemplate ? selectedTemplate.academyName : customAcademyName || '...'}</div>
                  <div>일시: {selectedTemplate ? selectedTemplate.date : customDate || '...'}</div>
                </div>
                <div style={{ borderTop: '1px dashed #777', paddingTop: '4px', display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                  <span>합계:</span>
                  <span>{selectedTemplate ? selectedTemplate.amountStr : (customAmount ? parseInt(customAmount).toLocaleString() + '원' : '...')}</span>
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.7rem', color: 'var(--neutral-muted)', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="calendar-day-event-dot exam" style={{ width: '8px', height: '8px', animation: 'pulseBorder 1s infinite' }} />
              신용카드 매출전표 OCR 딥러닝 분석기 가동 중
            </div>
          </div>
        )}

        {/* OCR RESULTS POPUP SCREEN */}
        {scanStep === 2 && ocrResults && (
          <div className="animate-slide-up" style={{ padding: '10px' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '2rem' }}>🔍</span>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginTop: '6px' }}>OCR 정보 추출 완료!</h4>
              <p style={{ fontSize: '0.7rem', color: 'var(--neutral-muted)' }}>
                추출된 텍스트와 영수증 실물이 일치하는지 확인해주세요.
              </p>
            </div>

            <div style={{ background: 'var(--neutral-light)', padding: '14px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--neutral-muted)' }}>가맹점명 (학원명):</span>
                <span style={{ fontWeight: '700' }}>{ocrResults.academyName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--neutral-muted)' }}>승인 일자:</span>
                <span style={{ fontWeight: '700' }}>{ocrResults.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--neutral-muted)' }}>수납 금액:</span>
                <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{ocrResults.amountStr}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '4px' }}>
                <span style={{ color: 'var(--neutral-muted)' }}>AI 문자 판독 신뢰도:</span>
                <span style={{ fontWeight: '700', color: 'var(--secondary)' }}>{ocrResults.confidence}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={() => setScanStep(0)} 
                className="action-btn action-btn-secondary" 
                style={{ flex: 1, padding: '10px' }}
              >
                다시 업로드
              </button>
              <button 
                onClick={handleFinalSubmit} 
                className="action-btn action-btn-primary" 
                style={{ flex: 2, padding: '10px' }}
              >
                관리자에게 승인 요청
              </button>
            </div>

            <p style={{ fontSize: '0.6rem', color: 'var(--neutral-muted)', textAlign: 'center', marginTop: '10px' }}>
              * 제출 즉시 우측 관리자 대시보드 검증 대기열에 실시간 등록됩니다.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
export default AppReceiptAuth;
