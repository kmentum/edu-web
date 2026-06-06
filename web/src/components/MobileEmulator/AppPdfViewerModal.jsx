import React, { useContext, useState } from 'react';
import { AppStateContext } from '../../context/AppStateContext';

export const AppPdfViewerModal = ({ pdf, onClose }) => {
  const { currentUser, purchasePdf } = useContext(AppStateContext);
  
  // viewMode: 'detail' (소개 및 구매), 'preview' (맛보기), 'full' (전체 본문)
  const [viewMode, setViewMode] = useState('detail');
  const [loading, setLoading] = useState(false);

  if (!currentUser || !pdf) return null;

  const isPurchased = (currentUser.purchasedPdfs || []).includes(pdf.id);

  const handlePurchase = async () => {
    if (window.confirm(`"${pdf.title}" 자료를 ${pdf.pricePoints.toLocaleString()}P로 구매하시겠습니까?\n(보유 포인트: ${currentUser.points.toLocaleString()}P)`)) {
      setLoading(true);
      const success = await purchasePdf(pdf.id, pdf.pricePoints);
      setLoading(false);
      if (success) {
        setViewMode('full');
      }
    }
  };

  const renderDetail = () => (
    <div className="pdf-modal-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="pdf-badge-row" style={{ display: 'flex', gap: '6px' }}>
        <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>{pdf.category}</span>
        <span className="badge badge-teal" style={{ fontSize: '0.65rem' }}>⭐ {pdf.rating.toFixed(1)}</span>
        <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>🔥 {pdf.salesCount}부 판매됨</span>
      </div>

      <h3 style={{ fontSize: '1rem', fontWeight: '800', lineHeight: '1.4', color: 'var(--neutral-dark)', margin: 0 }}>
        {pdf.title}
      </h3>

      <div style={{ fontSize: '0.72rem', color: 'var(--neutral-muted)' }}>
        <span>작성 학부모: </span>
        <strong style={{ color: 'var(--neutral-dark)' }}>{pdf.authorName}</strong>
      </div>

      <div style={{ borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '12px 0', fontSize: '0.75rem', lineHeight: '1.5', color: 'var(--neutral-text)' }}>
        <p style={{ margin: '0 0 6px' }}>📌 <strong>자료 설명</strong></p>
        <p style={{ margin: 0 }}>자녀의 학교 생활 및 시험에 실질적인 도움이 되는 학부모 노하우가 담겨 있습니다. (총 {pdf.pages}페이지 분량)</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--neutral-muted)' }}>판매 가격</span>
          <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent-gold)' }}>💎 {pdf.pricePoints.toLocaleString()}P</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--neutral-muted)' }}>보유 포인트</span>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--neutral-dark)' }}>{currentUser.points.toLocaleString()}P</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        <button
          type="button"
          onClick={() => setViewMode('preview')}
          className="action-btn action-btn-secondary"
          style={{ flex: 1, padding: '10px', fontSize: '0.8rem' }}
        >
          📄 맛보기 (무료 1P)
        </button>

        {isPurchased ? (
          <button
            type="button"
            onClick={() => setViewMode('full')}
            className="action-btn action-btn-primary"
            style={{ flex: 1.5, padding: '10px', fontSize: '0.8rem', backgroundColor: 'var(--secondary)' }}
          >
            📖 전체 열람하기
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePurchase}
            disabled={loading}
            className="action-btn action-btn-primary"
            style={{ flex: 1.5, padding: '10px', fontSize: '0.8rem' }}
          >
            {loading ? '구매 중...' : `💎 포인트 결제하기`}
          </button>
        )}
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="pdf-modal-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: '700' }}>📄 맛보기 (1페이지 / 무료 제공)</span>
        <button 
          onClick={() => setViewMode('detail')} 
          style={{ fontSize: '0.72rem', color: 'var(--neutral-muted)', fontWeight: '600' }}
        >
          돌아가기
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', maxHeight: '240px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.72rem', lineHeight: '1.6', whiteSpace: 'pre-line', color: '#334155' }}>
        {pdf.previewContent}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        {isPurchased ? (
          <button
            type="button"
            onClick={() => setViewMode('full')}
            className="action-btn action-btn-primary"
            style={{ flex: 1, padding: '8px', fontSize: '0.75rem', backgroundColor: 'var(--secondary)' }}
          >
            📖 전체 열람하기
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePurchase}
            disabled={loading}
            className="action-btn action-btn-primary"
            style={{ flex: 1, padding: '8px', fontSize: '0.75rem' }}
          >
            {loading ? '구매 중...' : `💎 전체 소장하기 (${pdf.pricePoints.toLocaleString()}P)`}
          </button>
        )}
      </div>
    </div>
  );

  const renderFull = () => (
    <div className="pdf-modal-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--secondary)', fontWeight: '700' }}>📖 소장용 전체 자료 리딩 (총 {pdf.pages}P)</span>
        <button 
          onClick={() => setViewMode('detail')} 
          style={{ fontSize: '0.72rem', color: 'var(--neutral-muted)', fontWeight: '600' }}
        >
          소개화면
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', maxHeight: '240px', padding: '12px', background: '#fff', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.72rem', lineHeight: '1.6', whiteSpace: 'pre-line', color: '#1e293b', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)' }}>
        {pdf.fullContent}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button
          type="button"
          onClick={() => {
            alert('가상 모바일 환경이므로 로컬 디바이스의 [다운로드] 폴더에 PDF가 안전하게 가상 다운로드되었습니다!');
          }}
          className="action-btn action-btn-primary"
          style={{ flex: 1, padding: '8px', fontSize: '0.75rem', backgroundColor: 'var(--neutral-dark)' }}
        >
          💾 디바이스 저장하기
        </button>
      </div>
    </div>
  );

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '16px',
      backdropFilter: 'blur(2px)'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '320px',
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.04)',
        padding: '18px',
        position: 'relative',
        animation: 'slideUp 0.3s ease-out'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: '#f1f5f9',
            border: 'none',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--neutral-muted)',
            fontWeight: 'bold',
            fontSize: '0.8rem'
          }}
        >
          ✕
        </button>

        {viewMode === 'detail' && renderDetail()}
        {viewMode === 'preview' && renderPreview()}
        {viewMode === 'full' && renderFull()}
      </div>
    </div>
  );
};

export default AppPdfViewerModal;
