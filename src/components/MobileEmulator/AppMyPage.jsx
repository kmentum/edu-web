import React, { useContext, useState } from 'react';
import { AppStateContext } from '../../context/AppStateContext';

export const AppMyPage = ({ onNavigate }) => {
  const { currentUser, updateUserPoints, logout } = useContext(AppStateContext);

  const [purchasedPdfs, setPurchasedPdfs] = useState([]);

  if (!currentUser) return null;

  const pdfCatalog = [
    { id: 'pdf-01', title: '대치동 초등 황소수학 입반 테스트 기출 경향 분석집', price: 3000, desc: '대치동 최상위 학원 합격생 100명의 오답 유형 분석 자료' },
    { id: 'pdf-02', title: '반포/서초 학원가 셔틀버스 노선도 및 승하차 위치 가이드', price: 1500, desc: '삼호가든 사거리 학원 셔틀 승차 안내 및 실시간 동선 꿀팁' },
    { id: 'pdf-03', title: '수능 만점자 엄마가 작성한 자녀 스마트폰 조절 계약서 양식', price: 2000, desc: '자녀가 자발적으로 참여하는 디지털 디톡스 규칙 설정 가이드' }
  ];

  const handleBuyPdf = (pdf) => {
    if (purchasedPdfs.includes(pdf.id)) {
      alert('이미 구매하신 가이드입니다.');
      return;
    }
    if (currentUser.points < pdf.price) {
      alert('포인트가 부족합니다. 영수증 인증이나 Q&A 활동으로 포인트를 모아보세요!');
      return;
    }

    if (window.confirm(`[${pdf.title}]\n${pdf.price}P에 구매하시겠습니까?`)) {
      updateUserPoints(currentUser.uid, -pdf.price);
      setPurchasedPdfs([...purchasedPdfs, pdf.id]);
      alert('구매가 완료되었습니다! "구매 완료" 상태에서 즉시 다운로드 가능합니다.');
    }
  };

  return (
    <div className="mobile-app-layout animate-fade-in" style={{ backgroundColor: 'white', height: '100%' }}>
      {/* Header */}
      <div className="mobile-header">
        <span className="mobile-logo-text">👤 마이페이지</span>
        <button onClick={logout} style={{ fontSize: '0.75rem', color: 'var(--accent-red)', fontWeight: '600' }}>
          로그아웃
        </button>
      </div>

      <div className="mobile-content-area" style={{ paddingBottom: '40px' }}>
        
        {/* Profile Card */}
        <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #1a237e 100%)', color: 'white', padding: '16px', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '50px' }}>
                구글 SSO 익명 가명 프로필
              </span>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', marginTop: '6px' }}>{currentUser.pseudonym}</h3>
              <p style={{ fontSize: '0.7rem', opacity: '0.8', marginTop: '2px' }}>
                실명: {currentUser.name} | {currentUser.email}
              </p>
            </div>
            
            <div style={{ background: 'var(--accent-gold)', color: 'white', padding: '6px 12px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: '600' }}>보유 포인트</div>
              <div style={{ fontSize: '0.95rem', fontWeight: '700' }}>{currentUser.points.toLocaleString()}P</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: '12px', paddingTop: '10px', display: 'flex', gap: '16px', fontSize: '0.7rem' }}>
            <div>🏫 {currentUser.schoolName} ({currentUser.grade})</div>
            <div>📍 {currentUser.region}</div>
          </div>
        </div>

        {/* VERIFIED ACADEMY LIST */}
        <div style={{ marginTop: '16px' }}>
          <span className="input-label">🛡️ 영수증으로 인증된 수강 학원 ({currentUser.verifiedAcademy?.length || 0})</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
            {!currentUser.verifiedAcademy || currentUser.verifiedAcademy.length === 0 ? (
              <div style={{ fontSize: '0.7rem', color: 'var(--neutral-muted)', fontStyle: 'italic', background: 'var(--neutral-light)', width: '100%', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                인증된 학원이 없습니다. 영수증을 업로드하여 첫 인증을 받아보세요.
              </div>
            ) : (
              currentUser.verifiedAcademy.map((acad, idx) => (
                <span 
                  key={idx} 
                  className="badge badge-teal" 
                  style={{ padding: '6px 10px', borderRadius: '50px', fontSize: '0.7rem', border: '1px solid var(--secondary)' }}
                >
                  ✔️ {acad}
                </span>
              ))
            )}
          </div>
        </div>

        {/* POINT SHOP (Utility - PDF Market) */}
        <div style={{ marginTop: '24px' }}>
          <div style={{ borderBottom: '2px solid var(--neutral-light)', paddingBottom: '6px', marginBottom: '10px' }}>
            <span className="input-label" style={{ fontSize: '0.8rem', color: 'var(--neutral-dark)' }}>📚 선배 맘 노하우 PDF 마켓 (포인트 샵)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pdfCatalog.map(pdf => {
              const isPurchased = purchasedPdfs.includes(pdf.id);
              
              return (
                <div 
                  key={pdf.id}
                  style={{
                    background: 'var(--white)',
                    border: '1px solid var(--neutral-light)',
                    borderRadius: '10px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h5 style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--neutral-dark)', flex: '1', paddingRight: '8px', lineHeight: '1.3' }}>
                      {pdf.title}
                    </h5>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-gold)' }}>
                      {pdf.price.toLocaleString()}P
                    </span>
                  </div>
                  <p style={{ fontSize: '0.68rem', color: 'var(--neutral-muted)' }}>{pdf.desc}</p>
                  
                  <button 
                    onClick={() => handleBuyPdf(pdf)}
                    className={`action-btn ${isPurchased ? 'action-btn-success' : 'action-btn-primary'}`}
                    style={{ alignSelf: 'flex-end', fontSize: '0.65rem', marginTop: '6px', padding: '4px 10px' }}
                  >
                    {isPurchased ? '📥 다운로드 받기 (구매완료)' : '포인트로 구매'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
export default AppMyPage;
