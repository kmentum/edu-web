import React, { useContext, useState } from 'react';
import { AppStateContext } from '../../context/AppStateContext';
import DashboardStats from './DashboardStats';
import AdminUsers from './AdminUsers';
import AdminContent from './AdminContent';
import AdminReceipts from './AdminReceipts';
import AdminCalendarComments from './AdminCalendarComments';

export const DashboardContainer = () => {
  const { resetToFactoryDefaults } = useContext(AppStateContext);
  
  // Navigation tabs: 'dashboard', 'users', 'content', 'receipts', 'calendar-comments'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Render matching sub-view
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardStats />;
      case 'users':
        return <AdminUsers />;
      case 'content':
        return <AdminContent />;
      case 'receipts':
        return <AdminReceipts />;
      case 'calendar-comments':
        return <AdminCalendarComments />;
      default:
        return <DashboardStats />;
    }
  };

  return (
    <div className="admin-layout animate-fade-in">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-logo">
          <span>🛡️</span>
          <span>EDU-MOM BACKOFFICE</span>
        </div>

        <nav className="admin-nav">
          <button 
            className={`admin-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span>📊</span>
            <span>종합 대시보드 홈</span>
          </button>
          <button 
            className={`admin-nav-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span>👥</span>
            <span>회원 / 권한 관리</span>
          </button>
          <button 
            className={`admin-nav-btn ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            <span>🚨</span>
            <span>콘텐츠 / 신고 관리</span>
          </button>
          <button 
            className={`admin-nav-btn ${activeTab === 'calendar-comments' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar-comments')}
          >
            <span>💬</span>
            <span>학사 일정 댓글 통제</span>
          </button>
          <button 
            className={`admin-nav-btn ${activeTab === 'receipts' ? 'active' : ''}`}
            onClick={() => setActiveTab('receipts')}
          >
            <span>🧾</span>
            <span>영수증 검증 센터</span>
          </button>
        </nav>

        {/* Playground Hard Reset Button */}
        <button 
          className="admin-reset-btn"
          onClick={resetToFactoryDefaults}
        >
          🔄 플레이그라운드 초기화
        </button>
      </div>

      {/* Main Panel */}
      <div className="admin-main">
        <header className="admin-header">
          <h2>
            {activeTab === 'dashboard' && '📊 실시간 통합 현황판'}
            {activeTab === 'users' && '👥 학부모 회원 DB 관리'}
            {activeTab === 'content' && '🚨 AI 콘텐츠 필터링 및 신고 누적 모니터링'}
            {activeTab === 'receipts' && '🧾 OCR 학원비 영수증 검증 통제실'}
            {activeTab === 'calendar-comments' && '💬 학사일정 대화 집중 모니터링 데스크'}
          </h2>
          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--neutral-muted)', background: 'var(--neutral-light)', padding: '6px 12px', borderRadius: '4px' }}>
            🔴 실시간 동기화 상태: 연결됨
          </div>
        </header>

        {/* Content Viewer scroll */}
        <div className="admin-content-scroll">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};
export default DashboardContainer;
