import React, { useContext, useState } from 'react';
import { AppStateContext } from '../../context/AppStateContext';
import { mockPdfs } from '../../data/mockPdfData';
import AppPdfViewerModal from './AppPdfViewerModal';

const CATEGORIES = ['전체', '초등 내신', '중등 내신', '학원 팁'];

const AppPdfMarket = ({ onNavigate }) => {
  const { currentUser } = useContext(AppStateContext);
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'rating' | 'newest'

  if (!currentUser) return null;

  // 필터 + 검색
  const filtered = mockPdfs
    .filter(pdf => {
      const matchCat = selectedCategory === '전체' || pdf.category === selectedCategory;
      const matchSearch =
        searchQuery === '' ||
        pdf.title.includes(searchQuery) ||
        pdf.schoolName.includes(searchQuery) ||
        pdf.authorName.includes(searchQuery);
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return b.salesCount - a.salesCount;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // newest: mock 데이터는 순서 유지
    });

  const purchasedIds = currentUser.purchasedPdfs || [];
  const purchasedPdfs = mockPdfs.filter(p => purchasedIds.includes(p.id));

  return (
    <div className="screen-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--neutral-light)' }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px 10px',
        background: 'white',
        borderBottom: '1px solid #f1f5f9',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--neutral-dark)', margin: 0 }}>
              📚 노하우 마켓
            </h2>
            <p style={{ fontSize: '0.62rem', color: 'var(--neutral-muted)', margin: '2px 0 0' }}>
              선배 학부모의 내신 족보 & 시험 꿀팁 자료
            </p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            borderRadius: '10px',
            padding: '6px 10px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.58rem', color: '#92400e', fontWeight: '600' }}>보유 포인트</div>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#b45309' }}>💎 {(currentUser.points || 0).toLocaleString()}P</div>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="학교명, 과목, 키워드 검색..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 32px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              fontSize: '0.72rem',
              background: '#f8fafc',
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />
          <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }} className="no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                flexShrink: 0,
                padding: '4px 12px',
                borderRadius: '20px',
                border: 'none',
                fontSize: '0.68rem',
                fontWeight: '700',
                cursor: 'pointer',
                background: selectedCategory === cat ? 'var(--primary)' : '#f1f5f9',
                color: selectedCategory === cat ? 'white' : 'var(--neutral-muted)',
                transition: 'all 0.15s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>

        {/* 내 소장 자료 섹션 */}
        {purchasedPdfs.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--neutral-dark)', marginBottom: '8px' }}>
              📖 내 소장 자료 ({purchasedPdfs.length}건)
            </div>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
              {purchasedPdfs.map(pdf => (
                <div
                  key={pdf.id}
                  onClick={() => setSelectedPdf(pdf)}
                  style={{
                    flexShrink: 0,
                    minWidth: '140px',
                    background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                    border: '1.5px solid #6ee7b7',
                    borderRadius: '12px',
                    padding: '10px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: '0.6rem', color: '#065f46', fontWeight: '700', marginBottom: '4px' }}>
                    📖 소장 완료
                  </div>
                  <div style={{
                    fontSize: '0.68rem', fontWeight: '700', color: '#064e3b',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {pdf.title}
                  </div>
                  <div style={{ fontSize: '0.58rem', color: '#6ee7b7', marginTop: '4px' }}>탭하여 열람 →</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sort bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--neutral-dark)' }}>
            전체 {filtered.length}건
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[['popular', '인기순'], ['rating', '별점순']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.62rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: sortBy === key ? 'var(--primary)' : '#f1f5f9',
                  color: sortBy === key ? 'white' : 'var(--neutral-muted)',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* PDF 카드 리스트 */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--neutral-muted)', fontSize: '0.75rem' }}>
            🔍 검색 결과가 없습니다.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(pdf => {
              const isPurchased = purchasedIds.includes(pdf.id);
              return (
                <div
                  key={pdf.id}
                  onClick={() => setSelectedPdf(pdf)}
                  style={{
                    background: 'white',
                    borderRadius: '14px',
                    border: isPurchased ? '1.5px solid #6ee7b7' : '1px solid #e2e8f0',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                  }}
                >
                  {/* 썸네일 아이콘 */}
                  <div style={{
                    flexShrink: 0,
                    width: '44px',
                    height: '54px',
                    background: isPurchased
                      ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)'
                      : 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                  }}>
                    {isPurchased ? '📖' : '📄'}
                  </div>

                  {/* 내용 */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '0.58rem', fontWeight: '700', padding: '2px 6px',
                        borderRadius: '4px', background: '#ede9fe', color: '#6d28d9',
                      }}>
                        {pdf.category}
                      </span>
                      {isPurchased && (
                        <span style={{
                          fontSize: '0.58rem', fontWeight: '700', padding: '2px 6px',
                          borderRadius: '4px', background: '#d1fae5', color: '#065f46',
                        }}>
                          소장 완료
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize: '0.73rem', fontWeight: '700', color: 'var(--neutral-dark)',
                      lineHeight: '1.3',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {pdf.title}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--neutral-muted)' }}>
                      by {pdf.authorName.split(' ').slice(-1)[0]} · {pdf.pages}페이지
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <div style={{ fontSize: '0.62rem', color: '#f59e0b' }}>
                        ⭐ {pdf.rating.toFixed(1)} <span style={{ color: 'var(--neutral-muted)' }}>({pdf.salesCount}명 구매)</span>
                      </div>
                      <div style={{
                        fontSize: '0.72rem', fontWeight: '800',
                        color: isPurchased ? '#065f46' : 'var(--accent-gold)',
                      }}>
                        {isPurchased ? '📖 열람하기' : `💎 ${pdf.pricePoints.toLocaleString()}P`}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 하단 여백 */}
        <div style={{ height: '20px' }} />
      </div>

      {/* PDF 뷰어 모달 */}
      {selectedPdf && (
        <AppPdfViewerModal pdf={selectedPdf} onClose={() => setSelectedPdf(null)} />
      )}
    </div>
  );
};

export default AppPdfMarket;
