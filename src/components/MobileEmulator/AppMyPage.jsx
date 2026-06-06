import React, { useContext, useState } from 'react';
import { AppStateContext } from '../../context/AppStateContext';
import { mockPdfs } from '../../data/mockPdfData';
import AppPdfViewerModal from './AppPdfViewerModal';

export const AppMyPage = ({ onNavigate }) => {
  const { currentUser, logout } = useContext(AppStateContext);
  const [selectedPdf, setSelectedPdf] = useState(null);

  if (!currentUser) return null;

  const pdfCatalog = mockPdfs;

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
              const isPurchased = (currentUser.purchasedPdfs || []).includes(pdf.id);
              
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
                      {pdf.pricePoints.toLocaleString()}P
                    </span>
                  </div>
                  <p style={{ fontSize: '0.68rem', color: 'var(--neutral-muted)' }}>
                    {pdf.schoolName} • 작성 학부모: {pdf.authorName.split(' ').slice(-1)[0]}
                  </p>
                  
                  <button 
                    onClick={() => setSelectedPdf(pdf)}
                    className={`action-btn ${isPurchased ? 'action-btn-success' : 'action-btn-primary'}`}
                    style={{ alignSelf: 'flex-end', fontSize: '0.65rem', marginTop: '6px', padding: '4px 10px' }}
                  >
                    {isPurchased ? '📖 열람 및 다운로드' : '자료 보기 및 구매'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* PDF 뷰어/구매 모달 */}
      {selectedPdf && (
        <AppPdfViewerModal 
          pdf={selectedPdf} 
          onClose={() => setSelectedPdf(null)} 
        />
      )}
    </div>
  );
};
export default AppMyPage;
