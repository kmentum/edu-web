import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppStateContext } from '../../context/AppStateContext';
import { mockAcademicCalendars } from '../../data/schoolData';
import { mockPdfs } from '../../data/mockPdfData';
import AppPdfViewerModal from './AppPdfViewerModal';

export const AppCalendar = ({ onNavigate }) => {
  const { 
    currentUser, 
    customCalendarEvents, 
    addCalendarEvent,
    calendarComments,
    subscribedEvents,
    addCalendarComment,
    toggleSubscribeEvent,
    ensureSyncedPostExists,
    showNotifDropdown,
    setShowNotifDropdown,
    notifications,
    markNotificationsAsRead,
    deleteComment
  } = useContext(AppStateContext);

  const [selectedDay, setSelectedDay] = useState(30); // Default to current day 30 (May 30 or June 30)
  const [currentMonth, setCurrentMonth] = useState(6); // June 2026
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom event inputs
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState('event');
  const [newEventMemo, setNewEventMemo] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // V2 Drawer States
  const [activeEvent, setActiveEvent] = useState(null);
  const [gradeFilter, setGradeFilter] = useState('전체');
  const [drawerCommentText, setDrawerCommentText] = useState('');
  const [selectedPdf, setSelectedPdf] = useState(null);

  const relatedPdfs = mockPdfs.filter(pdf => pdf.schoolName === currentUser.schoolName);
  
  const commentsEndRef = useRef(null);

  // Auto scroll to bottom of comments when drawer comments list length changes
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [calendarComments, activeEvent]);

  if (!currentUser) return null;

  // Retrieve base academic calendar for user's school
  const baseSchoolEvents = mockAcademicCalendars[currentUser.schoolName] || mockAcademicCalendars['default'];
  
  // Retrieve user's manually added events for this school
  const userSchoolEvents = customCalendarEvents[currentUser.schoolName] || [];
  
  // Merge all events
  const allEvents = [...baseSchoolEvents, ...userSchoolEvents];

  const searchedEvents = searchQuery.trim() !== '' 
    ? allEvents.filter(e => 
        (e.title && e.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.memo && e.memo.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  // Helper to get events for a specific day in June 2026 (yyyy-MM-dd)
  const getEventsForDate = (dayNum) => {
    const dateStr = `2026-06-${String(dayNum).padStart(2, '0')}`;
    return allEvents.filter(e => e.date === dateStr);
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEventTitle.trim()) {
      alert('일정명을 입력해주세요.');
      return;
    }

    const dateStr = `2026-06-${String(selectedDay).padStart(2, '0')}`;
    addCalendarEvent(currentUser.schoolName, newEventTitle, dateStr, newEventType, newEventMemo);

    // Reset Form
    setNewEventTitle('');
    setNewEventMemo('');
    setShowAddForm(false);
    alert('학사 캘린더에 일정이 추가되었습니다.');
  };

  const handleSendDrawerComment = (e) => {
    e.preventDefault();
    if (!drawerCommentText.trim() || !activeEvent) return;
    
    addCalendarComment(
      currentUser.schoolName,
      activeEvent.id,
      activeEvent.title,
      drawerCommentText.trim(),
      currentUser.grade || '5학년'
    );
    
    setDrawerCommentText('');
  };

  // Build June 2026 calendar days
  // June 1st 2026 is Monday.
  const totalDays = 30;
  const startDayOffset = 1; // Monday starts at column 1 (Sunday is 0)
  
  const daysArray = [];
  // Empty spaces for previous month (offset)
  for (let i = 0; i < startDayOffset; i++) {
    daysArray.push({ type: 'empty' });
  }
  // Days of June
  for (let i = 1; i <= totalDays; i++) {
    daysArray.push({ type: 'day', number: i });
  }

  const selectedDateEvents = getEventsForDate(selectedDay);

  // Active drawer comments
  const drawerComments = activeEvent
    ? calendarComments.filter(c => c.postId === `post-cal-${activeEvent.id}` && !c.isBanned && (gradeFilter === '전체' || c.grade === gradeFilter))
    : [];

  const isSubscribed = activeEvent ? subscribedEvents.includes(activeEvent.id) : false;

  return (
    <div className="mobile-app-layout animate-fade-in" style={{ backgroundColor: 'white', height: '100%', position: 'relative' }}>
      {/* Header with Search, Notif, MyPage */}
      <div className="mobile-header">
        {isSearchExpanded ? (
          <div className="search-bar-container" style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--neutral-muted)' }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" />
            </svg>
            <input 
              type="text" 
              placeholder="일정 검색..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '0.85rem',
                color: 'var(--neutral-dark)',
                padding: '4px 0'
              }}
              autoFocus
            />
            <button 
              onClick={() => { setIsSearchExpanded(false); setSearchQuery(''); }}
              style={{ background: 'none', border: 'none', fontSize: '1rem', color: 'var(--neutral-muted)', cursor: 'pointer', padding: '0 4px' }}
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <span className="mobile-logo-text">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle', color: '#64748b' }}>
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
              학사일정
            </span>
            <div className="mobile-header-actions">
              <button 
                onClick={() => setIsSearchExpanded(true)}
                className="header-icon-btn"
                title="검색"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" x2="16.65" y1="21" y2="16.65" />
                </svg>
              </button>
              <button 
                onClick={() => {
                  setShowNotifDropdown(!showNotifDropdown);
                  markNotificationsAsRead();
                }}
                className="header-icon-btn"
                style={{ position: 'relative' }}
                title="푸시 알림 내역"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                {notifications.filter(n => n.unread).length > 0 && (
                  <span className="notif-badge-dot" />
                )}
              </button>
              <button 
                onClick={() => onNavigate('mypage')}
                className="header-icon-btn"
                title="마이페이지"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      <div className="mobile-content-area" style={{ paddingBottom: '30px' }}>
        
        {/* Calendar Navigation header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '4px 0' }}>
          <h4 style={{ fontWeight: '700', fontSize: '0.9rem' }}>2026년 6월</h4>
          <span style={{ fontSize: '0.65rem', color: 'var(--neutral-muted)' }}>
            * NEIS 연동 학사 정보 자동 반영됨
          </span>
        </div>

        {/* Calendar Grid */}
        <div style={{ background: 'var(--neutral-light)', padding: '8px', borderRadius: '12px' }}>
          <div className="calendar-grid">
            {['일', '월', '화', '수', '목', '금', '토'].map(d => (
              <div key={d} className="calendar-day-header">{d}</div>
            ))}
            
            {daysArray.map((day, idx) => {
              if (day.type === 'empty') {
                return <div key={`empty-${idx}`} className="calendar-day other-month" />;
              }

              const dayEvents = getEventsForDate(day.number);
              const isSelected = selectedDay === day.number;
              
              return (
                <div 
                  key={`day-${day.number}`}
                  onClick={() => {
                    setSelectedDay(day.number);
                    setShowAddForm(false);
                  }}
                  className={`calendar-day ${isSelected ? 'today' : ''}`}
                  style={{
                    backgroundColor: isSelected ? 'var(--primary-light)' : 'white',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--neutral-light)'
                  }}
                >
                  <span style={{ fontWeight: isSelected ? '700' : '400', color: idx % 7 === 0 ? 'red' : idx % 7 === 6 ? 'blue' : 'black' }}>
                    {day.number}
                  </span>
                  
                  {dayEvents.length > 0 && (
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {dayEvents.slice(0, 3).map((e, index) => (
                        <div 
                          key={index}
                          className={`calendar-day-event-dot ${
                            e.type === 'exam' ? 'exam' : e.type === 'holiday' ? 'holiday' : ''
                          }`} 
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Schedule Details */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="input-label">
              {searchQuery.trim() !== '' ? `검색 결과 (${searchedEvents.length})` : `6월 ${selectedDay}일 일정 (${selectedDateEvents.length})`}
            </span>
            {searchQuery.trim() === '' && (
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700' }}
              >
                {showAddForm ? '닫기' : '+ 일정 추가'}
              </button>
            )}
          </div>

          {/* Add custom event form */}
          {showAddForm && searchQuery.trim() === '' && (
            <form onSubmit={handleAddEvent} className="auth-custom-form animate-slide-up" style={{ background: 'var(--neutral-light)', padding: '12px', borderRadius: '8px', marginBottom: '12px', gap: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                <input 
                  type="text"
                  className="text-input"
                  style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                  placeholder="일정명 (예: 수학 레벨테스트)"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                />
                <select
                  className="text-input"
                  style={{ padding: '6px', fontSize: '0.75rem' }}
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value)}
                >
                  <option value="event">행사</option>
                  <option value="exam">시험</option>
                  <option value="holiday">휴업일</option>
                </select>
              </div>
              <input 
                type="text"
                className="text-input"
                style={{ padding: '6px 10px', fontSize: '0.7rem' }}
                placeholder="상세 설명 (메모)"
                value={newEventMemo}
                onChange={(e) => setNewEventMemo(e.target.value)}
              />
              <button type="submit" className="submit-btn" style={{ padding: '6px', fontSize: '0.7rem' }}>
                학사 캘린더 등록
              </button>
            </form>
          )}

          {/* Render Schedule list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {searchQuery.trim() !== '' ? (
              searchedEvents.length === 0 ? (
                <p style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', fontStyle: 'italic', textAlign: 'center', padding: '10px' }}>
                  검색 결과 일치하는 일정이 없습니다.
                </p>
              ) : (
                searchedEvents.map(event => (
                  <div 
                    key={event.id}
                    onClick={() => {
                      setActiveEvent(event);
                      setGradeFilter('전체');
                    }}
                    className={`calendar-event-card ${event.type === 'exam' ? 'exam' : event.type === 'holiday' ? 'holiday' : ''}`}
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                    title="일정 상세 및 댓글창 열기"
                  >
                    <div style={{ fontWeight: '700', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#64748b' }}>
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        {event.title}
                      </span>
                      <span className="badge" style={{ fontSize: '0.55rem', padding: '1px 4px' }}>
                        {event.type === 'exam' ? '시험/평가' : event.type === 'holiday' ? '휴업/방학' : '학교행사'}
                      </span>
                    </div>
                    {event.memo && (
                      <div style={{ color: 'var(--neutral-text)', fontSize: '0.65rem', marginTop: '3px' }}>
                        {event.memo}
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.62rem', color: 'var(--primary)', fontWeight: '600' }}>
                      <span>👉 실시간 대화창 입장 ({calendarComments.filter(c => c.eventId === event.id && !c.isBanned).length})</span>
                      {subscribedEvents.includes(event.id) && <span style={{ color: 'var(--secondary)' }}>🔔 알림구독 중</span>}
                    </div>
                  </div>
                ))
              )
            ) : selectedDateEvents.length === 0 ? (
              <p style={{ fontSize: '0.75rem', color: 'var(--neutral-muted)', fontStyle: 'italic', textAlign: 'center', padding: '10px' }}>
                등록된 학사 일정이 없습니다.
              </p>
            ) : (
              selectedDateEvents.map(event => (
                <div 
                  key={event.id}
                  onClick={() => {
                    setActiveEvent(event);
                    setGradeFilter('전체');
                  }}
                  className={`calendar-event-card ${event.type === 'exam' ? 'exam' : event.type === 'holiday' ? 'holiday' : ''}`}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  title="일정 상세 및 댓글창 열기"
                >
                  <div style={{ fontWeight: '700', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#64748b' }}>
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      {event.title}
                    </span>
                    <span className="badge" style={{ fontSize: '0.55rem', padding: '1px 4px' }}>
                      {event.type === 'exam' ? '시험/평가' : event.type === 'holiday' ? '휴업/방학' : '학교행사'}
                    </span>
                  </div>
                  {event.memo && (
                    <div style={{ color: 'var(--neutral-text)', fontSize: '0.65rem', marginTop: '3px' }}>
                      {event.memo}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.62rem', color: 'var(--primary)', fontWeight: '600' }}>
                    <span>👉 실시간 대화창 입장 ({calendarComments.filter(c => c.eventId === event.id && !c.isBanned).length})</span>
                    {subscribedEvents.includes(event.id) && <span style={{ color: 'var(--secondary)' }}>🔔 알림구독 중</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* --- V2 CALENDAR COMMENTS SLIDE-UP DRAWER --- */}
      {activeEvent && (
        <>
          {/* Backdrop blur */}
          <div 
            onClick={() => setActiveEvent(null)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(2px)',
              zIndex: '100',
              animation: 'fadeIn 0.2s ease-out'
            }}
          />

          {/* Drawer Wrapper */}
          <div 
            className="calendar-comments-drawer"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '80%',
              backgroundColor: 'white',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              boxShadow: '0 -10px 25px rgba(0,0,0,0.15)',
              zIndex: '101',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Handle bar */}
            <div style={{ width: '40px', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '10px', margin: '10px auto 4px' }} />

            {/* Header */}
            <div style={{ padding: '4px 16px 10px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, paddingRight: '8px' }}>
                <span className={`badge ${activeEvent.type === 'exam' ? 'badge-red' : activeEvent.type === 'holiday' ? 'badge-gold' : 'badge-indigo'}`} style={{ marginBottom: '4px' }}>
                  {activeEvent.type === 'exam' ? '시험' : activeEvent.type === 'holiday' ? '휴업' : '행사'}
                </span>
                <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--neutral-dark)' }}>
                  {activeEvent.title} 대화방
                </h4>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {/* Subscribe Toggle Button */}
                <button 
                  onClick={() => toggleSubscribeEvent(currentUser.schoolName, activeEvent.id, activeEvent.title)}
                  className={`badge ${isSubscribed ? 'badge-green' : 'badge-indigo'}`}
                  style={{ border: '1px solid currentColor', fontSize: '0.65rem', padding: '4px 8px', cursor: 'pointer' }}
                >
                  {isSubscribed ? '🔔 알림 해제' : '🔕 알림 구독'}
                </button>
                
                {/* Close Button */}
                <button 
                  onClick={() => setActiveEvent(null)}
                  style={{ fontSize: '1.2rem', color: 'var(--neutral-muted)', fontWeight: '400', padding: '4px' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Grade Filter scroll chips */}
            <div style={{ 
              display: 'flex', 
              gap: '6px', 
              padding: '10px 16px', 
              borderBottom: '1px solid #f1f5f9', 
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              background: '#f8fafc'
            }}>
              {['전체', '1학년', '2학년', '3학년', '4학년', '5학년', '6학년'].map(grade => (
                <button 
                  key={grade}
                  onClick={() => setGradeFilter(grade)}
                  className={`filter-badge ${gradeFilter === grade ? 'active' : ''}`}
                  style={{ 
                    padding: '4px 10px', 
                    fontSize: '0.7rem', 
                    margin: 0,
                    backgroundColor: gradeFilter === grade ? 'var(--primary)' : 'white'
                  }}
                >
                  {grade}
                </button>
              ))}
            </div>

            {/* Comments List scrolling viewport */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', background: '#fafafa' }}>
              {/* UTIL-06: 관련 추천 PDF 자료 리스트 */}
              {relatedPdfs.length > 0 && (
                <div style={{
                  background: 'var(--neutral-light)',
                  border: '1px solid rgba(79, 70, 229, 0.1)',
                  borderRadius: '16px',
                  padding: '12px',
                  marginBottom: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  flexShrink: 0
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--neutral-dark)' }}>
                      🎓 {currentUser.schoolName.substring(0, 6)}... 맞춤 내신/족보 자료
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '700' }}>추천</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', whiteSpace: 'nowrap' }} className="no-scrollbar">
                    {relatedPdfs.map(pdf => {
                      const isPdfPurchased = (currentUser.purchasedPdfs || []).includes(pdf.id);
                      return (
                        <div 
                          key={pdf.id}
                          onClick={() => setSelectedPdf(pdf)}
                          style={{
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '8px 10px',
                            minWidth: '200px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                          }}
                        >
                          <div style={{ fontSize: '0.58rem', color: 'var(--neutral-muted)', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{pdf.category}</span>
                            <span style={{ color: isPdfPurchased ? 'var(--secondary)' : 'var(--accent-gold)', fontWeight: '700' }}>
                              {isPdfPurchased ? '📖 소장 중' : `💎 ${pdf.pricePoints.toLocaleString()}P`}
                            </span>
                          </div>
                          <div style={{ 
                            fontSize: '0.7rem', 
                            fontWeight: '700', 
                            color: 'var(--neutral-dark)', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap' 
                          }}>
                            {pdf.title}
                          </div>
                          <div style={{ fontSize: '0.58rem', color: 'var(--neutral-muted)', display: 'flex', justifyContent: 'space-between' }}>
                            <span>by {pdf.authorName.split(' ').slice(-1)[0]}</span>
                            <span>⭐ {pdf.rating.toFixed(1)} ({pdf.salesCount}부)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {drawerComments.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--neutral-muted)', fontSize: '0.75rem', margin: 'auto' }}>
                  아직 작성된 학사일정 댓글이 없습니다.<br/>
                  첫 대화를 시작하고 실시간 정보교환을 유도해보세요!
                </p>
              ) : (
                drawerComments.map(comment => (
                  <div 
                    key={comment.id}
                    style={{
                      background: comment.authorUid === 'bot-user' ? '#f0fdfa' : 'white',
                      border: comment.authorUid === 'bot-user' ? '1px solid #ccfbf1' : '1px solid #e2e8f0',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontWeight: '700', color: comment.authorUid === 'bot-user' ? 'var(--secondary)' : 'var(--neutral-dark)' }}>
                          {comment.authorName}
                        </span>
                        <span className="badge badge-indigo" style={{ fontSize: '0.55rem', padding: '1px 4px' }}>
                          자녀: {comment.grade}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: 'var(--neutral-muted)', fontSize: '0.65rem' }}>
                          {new Date(comment.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {comment.authorUid === currentUser.uid && (
                          <button 
                            onClick={() => {
                              if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
                                deleteComment(comment.id);
                                alert('댓글이 삭제되었습니다.');
                              }
                            }}
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              fontSize: '0.65rem', 
                              color: 'var(--accent-red)', 
                              fontWeight: '600',
                              padding: 0,
                              cursor: 'pointer' 
                            }}
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <p style={{ fontSize: '0.78rem', color: 'var(--neutral-text)', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                      {comment.content}
                    </p>
                  </div>
                ))
              )}
              <div ref={commentsEndRef} />
            </div>

            {/* Write comment bar */}
            <form 
              onSubmit={handleSendDrawerComment}
              style={{
                padding: '10px 16px 20px',
                borderTop: '1px solid #f1f5f9',
                backgroundColor: 'white',
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}
            >
              <input 
                type="text"
                className="comment-input"
                style={{ padding: '10px 14px', fontSize: '0.78rem', flex: 1, backgroundColor: '#f1f5f9', border: 'none' }}
                placeholder={`${currentUser.grade || '5학년'} 자녀 부모로서 대화 나누기...`}
                value={drawerCommentText}
                onChange={(e) => setDrawerCommentText(e.target.value)}
              />
              <button 
                type="submit"
                className="comment-submit-btn"
                style={{ height: '36px', width: '60px', padding: 0, borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                전송
              </button>
            </form>
          </div>
        </>
      )}

      {/* UTIL-06: PDF 뷰어/구매 모달 */}
      {selectedPdf && (
        <AppPdfViewerModal 
          pdf={selectedPdf} 
          onClose={() => setSelectedPdf(null)} 
        />
      )}
    </div>
  );
};
export default AppCalendar;
