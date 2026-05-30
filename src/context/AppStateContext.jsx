import React, { createContext, useState, useEffect } from 'react';
import { mockUsers, mockPosts, mockComments, mockReceipts } from '../data/mockInitialData';

export const AppStateContext = createContext();

// Helper to generate a random pseudonym based on region, school, grade
const generatePseudonym = (region, schoolName, grade) => {
  const adjectives = ['든든한', '영리한', '날렵한', '현명한', '자상한', '행복한', '명랑한', '신중한', '활기찬', '빛나는'];
  const nouns = ['올빼미', '돌고래', '표범', '부엉이', '독수리', '사자', '토끼', '기린', '코끼리', '호랑이'];
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  // Extract school short name e.g. "서울반포초등학교" -> "반포초"
  let schoolShort = '';
  if (schoolName) {
    schoolShort = schoolName.replace('서울', '').replace('광주', '').replace('부산', '').replace('대구', '');
    if (schoolShort.length > 5) {
      schoolShort = schoolShort.substring(0, 3) + schoolShort.slice(-2); // e.g. 와이즈만영재 -> 와이즈영재
    }
  }
  
  // Format: [Region + SchoolShort + Grade + adj + noun]
  const regionShort = region ? region.trim() : '전국';
  const gradeShort = grade ? grade.replace('학년', '') : '';
  
  return `${regionShort} ${schoolShort}${gradeShort} ${adj}${noun}`;
};

// Check for toxic words / ad content (AI Filtering Simulation)
const runAIFilter = (title, content) => {
  const toxicKeywords = ['바보', '쓰레기', '광고', '선동', '벼락거지', '폭락', '폭등', '가짜', '사기', '개이득', '단톡방'];
  const foundKeywords = [];
  
  const checkText = `${title} ${content}`.toLowerCase();
  toxicKeywords.forEach(word => {
    if (checkText.includes(word)) {
      foundKeywords.push(word);
    }
  });
  
  return {
    isFlagged: foundKeywords.length > 0,
    keywords: foundKeywords.join(', ')
  };
};

export const AppStateProvider = ({ children }) => {
  // 1. Core State loaded from LocalStorage or Hydrated with Mock Data
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('edu_users');
    return saved ? JSON.parse(saved) : mockUsers;
  });

  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('edu_posts');
    return saved ? JSON.parse(saved) : mockPosts;
  });

  const [comments, setComments] = useState(() => {
    const saved = localStorage.getItem('edu_comments');
    return saved ? JSON.parse(saved) : mockComments;
  });

  const [receipts, setReceipts] = useState(() => {
    const saved = localStorage.getItem('edu_receipts');
    return saved ? JSON.parse(saved) : mockReceipts;
  });

  // Mobile Parent App state: Current User logged in
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('edu_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // School calendars data
  const [customCalendarEvents, setCustomCalendarEvents] = useState(() => {
    const saved = localStorage.getItem('edu_custom_calendar');
    return saved ? JSON.parse(saved) : {};
  });

  // --- NEW V2 STATES ---
  const calendarComments = comments.filter(c => c.postId && c.postId.startsWith('post-cal-'));

  const [subscribedEvents, setSubscribedEvents] = useState(() => {
    const saved = localStorage.getItem('edu_subscribed_events');
    return saved ? JSON.parse(saved) : ['cal-bp-04'];
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('edu_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeNotification, setActiveNotification] = useState(null);

  // Save to LocalStorage whenever states change
  useEffect(() => {
    localStorage.setItem('edu_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('edu_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('edu_comments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem('edu_receipts', JSON.stringify(receipts));
  }, [receipts]);

  useEffect(() => {
    localStorage.setItem('edu_current_user', currentUser ? JSON.stringify(currentUser) : '');
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('edu_custom_calendar', JSON.stringify(customCalendarEvents));
  }, [customCalendarEvents]);

  useEffect(() => {
    localStorage.setItem('edu_subscribed_events', JSON.stringify(subscribedEvents));
  }, [subscribedEvents]);

  useEffect(() => {
    localStorage.setItem('edu_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Synchronize current user status (e.g. if banned by Admin, or points changed)
  useEffect(() => {
    if (currentUser) {
      const freshUser = users.find(u => u.uid === currentUser.uid);
      if (freshUser) {
        if (freshUser.isBanned) {
          // Instantly log out the user if they got banned
          setCurrentUser(null);
          alert('해당 계정은 관리자에 의해 이용 정지(Ban)되었습니다.');
        } else if (JSON.stringify(freshUser) !== JSON.stringify(currentUser)) {
          setCurrentUser(freshUser);
        }
      }
    }
  }, [users, currentUser]);

  // RESET ALL DATA TO INITIAL STATS
  const resetToFactoryDefaults = () => {
    if (window.confirm('모든 데이터를 초기 기본 상태로 리셋하시겠습니까?')) {
      localStorage.clear();
      setUsers(mockUsers);
      setPosts(mockPosts);
      setComments(mockComments);
      setReceipts(mockReceipts);
      setCurrentUser(null);
      setCustomCalendarEvents({});
      setCalendarComments([]);
      setSubscribedEvents(['cal-bp-04']);
      setNotifications([]);
      setActiveNotification(null);
      window.location.reload();
    }
  };

  // 2. Authentication Actions
  const loginWithMockAccount = (uid) => {
    const target = users.find(u => u.uid === uid);
    if (!target) return false;
    if (target.isBanned) {
      alert('이 계정은 영구 차단되었습니다.');
      return false;
    }
    setCurrentUser(target);
    return true;
  };

  const loginCustomEmail = (name, email) => {
    const existing = users.find(u => u.email === email);
    if (existing) {
      if (existing.isBanned) {
        alert('이 계정은 영구 차단되었습니다.');
        return false;
      }
      setCurrentUser(existing);
      return true;
    }

    // Register a new user
    const newUser = {
      uid: `google-user-${Date.now()}`,
      email,
      name,
      schoolName: '',
      schoolLevel: '',
      grade: '',
      region: '',
      pseudonym: '',
      points: 1000, // Welcome points
      isBanned: false,
      verifiedAcademy: [],
      createdAt: new Date().toISOString(),
    };
    
    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const completeProfileSetup = (schoolName, schoolLevel, grade, region) => {
    if (!currentUser) return;
    
    const pseudonym = generatePseudonym(region, schoolName, grade);
    
    setUsers(prev => prev.map(u => {
      if (u.uid === currentUser.uid) {
        return { ...u, schoolName, schoolLevel, grade, region, pseudonym };
      }
      return u;
    }));

    setCurrentUser(prev => ({
      ...prev,
      schoolName,
      schoolLevel,
      grade,
      region,
      pseudonym
    }));
  };

  // 3. Community Feed Actions
  const createPost = (title, content, category, type, options = {}) => {
    if (!currentUser) return null;

    const filterResult = runAIFilter(title, content);

    const newPost = {
      id: `post-${Date.now()}`,
      authorUid: currentUser.uid,
      authorName: currentUser.pseudonym || '익명 학부모',
      category, // '자유', '질문', '리뷰'
      title,
      content,
      schoolName: currentUser.schoolName,
      region: currentUser.region,
      type, // 'school', 'region', 'all'
      likes: 0,
      likedBy: [],
      scraps: 0,
      scrapedBy: [],
      reports: 0,
      reportedBy: [],
      commentsCount: 0,
      isAiFlaged: filterResult.isFlagged,
      aiFlagReason: filterResult.isFlagged ? `AI 필터링 감지: "${filterResult.keywords}" 포함` : '',
      isBanned: false,
      createdAt: new Date().toISOString(),
      hasReceiptBadge: category === '리뷰' && options.hasReceiptBadge ? true : false,
      qnaPoints: category === '질문' ? (parseInt(options.qnaPoints) || 0) : 0,
      qnaResolved: false,
      pollOptions: options.pollOptions ? options.pollOptions.map(opt => ({ text: opt, votes: 0, votedUids: [] })) : null,
    };

    // Deduct Q&A points if user set points for questions
    if (newPost.qnaPoints > 0) {
      if (currentUser.points < newPost.qnaPoints) {
        alert('포인트가 부족하여 Q&A 채택 포인트를 설정할 수 없습니다.');
        return null;
      }
      updateUserPointsLocally(currentUser.uid, -newPost.qnaPoints);
    }

    setPosts(prev => [newPost, ...prev]);
    return newPost;
  };

  const deletePost = (postId) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, isBanned: true } : p));
  };

  const restorePost = (postId) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, isAiFlaged: false, isBanned: false, reports: 0, reportedBy: [] } : p));
  };

  const toggleLikePost = (postId) => {
    if (!currentUser) return;
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const hasLiked = p.likedBy.includes(currentUser.uid);
        const likedBy = hasLiked 
          ? p.likedBy.filter(uid => uid !== currentUser.uid) 
          : [...p.likedBy, currentUser.uid];
        return { ...p, likes: likedBy.length, likedBy };
      }
      return p;
    }));
  };

  const toggleScrapPost = (postId) => {
    if (!currentUser) return;
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const hasScraped = p.scrapedBy.includes(currentUser.uid);
        const scrapedBy = hasScraped 
          ? p.scrapedBy.filter(uid => uid !== currentUser.uid) 
          : [...p.scrapedBy, currentUser.uid];
        return { ...p, scraps: scrapedBy.length, scrapedBy };
      }
      return p;
    }));
  };

  const reportPost = (postId, reason) => {
    if (!currentUser) return;
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        if (p.reportedBy.includes(currentUser.uid)) {
          alert('이미 신고한 게시글입니다.');
          return p;
        }
        const reportedBy = [...p.reportedBy, currentUser.uid];
        const reports = reportedBy.length;
        // Auto-blind if reports reach 3
        const isAiFlaged = p.isAiFlaged || reports >= 3;
        const aiFlagReason = p.isAiFlaged 
          ? p.aiFlagReason 
          : (reports >= 3 ? '사용자 누적 신고 3회 이상' : p.aiFlagReason);
        
        alert('신고가 접수되었습니다. 관리자 확인 후 처리됩니다.');
        return { ...p, reports, reportedBy, isAiFlaged, aiFlagReason };
      }
      return p;
    }));
  };

  const votePoll = (postId, optionIndex) => {
    if (!currentUser) return;
    setPosts(prev => prev.map(p => {
      if (p.id === postId && p.pollOptions) {
        const updatedPoll = p.pollOptions.map((opt, idx) => {
          // Remove from other options first, then add to the selected option if not already voted
          const hasVotedThis = opt.votedUids.includes(currentUser.uid);
          let votedUids = opt.votedUids.filter(uid => uid !== currentUser.uid);
          if (idx === optionIndex && !hasVotedThis) {
            votedUids.push(currentUser.uid);
          }
          return {
            ...opt,
            votes: votedUids.length,
            votedUids
          };
        });
        return { ...p, pollOptions: updatedPoll };
      }
      return p;
    }));
  };

  // 4. Comments & Q&A
  const addComment = (postId, content, grade = null, authorOverrides = null) => {
    if (!currentUser) return;
    const newComment = {
      id: `comment-${Date.now()}`,
      postId,
      authorUid: authorOverrides ? authorOverrides.uid : currentUser.uid,
      authorName: authorOverrides ? authorOverrides.pseudonym : (currentUser.pseudonym || '익명 학부모'),
      content,
      createdAt: new Date().toISOString(),
      isAccepted: false,
      grade: grade || (postId.startsWith('post-cal-') ? (authorOverrides ? authorOverrides.grade : currentUser.grade) : null),
      isBanned: false
    };

    setComments(prev => [...prev, newComment]);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p));
    return newComment;
  };

  const acceptComment = (postId, commentId) => {
    if (!currentUser) return;
    
    const post = posts.find(p => p.id === postId);
    if (!post || post.authorUid !== currentUser.uid || post.qnaResolved) return;

    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    // Set Resolved and Accepted
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, isAccepted: true } : c));
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, qnaResolved: true } : p));

    // Pay points to commenter
    if (post.qnaPoints > 0) {
      updateUserPointsLocally(comment.authorUid, post.qnaPoints);
      alert(`답변이 채택되었습니다! 작성자에게 ${post.qnaPoints}P가 지급되었습니다.`);
    }
  };

  // 5. OCR & Receipt Authentication
  const submitReceipt = (academyName, date, amountStr, templateId) => {
    if (!currentUser) return;

    const numericAmount = parseInt(amountStr.replace(/[^0-9]/g, '')) || 0;
    
    const newReceipt = {
      id: `rcpt-${Date.now()}`,
      userUid: currentUser.uid,
      userName: currentUser.name,
      userPseudonym: currentUser.pseudonym,
      academyName,
      date,
      amount: numericAmount,
      amountStr,
      ocrData: {
        academyName,
        date,
        amount: amountStr
      },
      status: 'pending',
      reviewerMemo: '',
      createdAt: new Date().toISOString(),
    };

    setReceipts(prev => [newReceipt, ...prev]);
    alert('영수증 인증 검증 요청이 전송되었습니다. 관리자 승인 후 확인 가능합니다.');
  };

  // 6. Admin Panel Modifiers
  const approveReceipt = (receiptId) => {
    const rcpt = receipts.find(r => r.id === receiptId);
    if (!rcpt) return;

    setReceipts(prev => prev.map(r => r.id === receiptId ? { ...r, status: 'approved', reviewedAt: new Date().toISOString(), reviewerMemo: '관리자 최종 승인 완료' } : r));
    
    // Add verified academy badge to the user & award points (+5000P)
    setUsers(prev => prev.map(u => {
      if (u.uid === rcpt.userUid) {
        const academies = u.verifiedAcademy || [];
        const nextAcademies = academies.includes(rcpt.academyName) ? academies : [...academies, rcpt.academyName];
        return {
          ...u,
          points: u.points + 5000,
          verifiedAcademy: nextAcademies
        };
      }
      return u;
    }));
  };

  const rejectReceipt = (receiptId, memo) => {
    setReceipts(prev => prev.map(r => r.id === receiptId ? { ...r, status: 'rejected', reviewedAt: new Date().toISOString(), reviewerMemo: memo || '서류 불충분으로 반려' } : r));
  };

  const banUser = (uid) => {
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isBanned: true } : u));
  };

  const unbanUser = (uid) => {
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isBanned: false } : u));
  };

  const updateUserGrade = (uid, newGrade) => {
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, grade: newGrade } : u));
  };

  const updateUserPoints = (uid, deltaPoints) => {
    updateUserPointsLocally(uid, deltaPoints);
  };

  const addCalendarEvent = (schoolName, title, date, type, memo) => {
    const newEvent = {
      id: `cal-custom-${Date.now()}`,
      title,
      date,
      type, // 'holiday', 'event', 'exam'
      memo
    };

    setCustomCalendarEvents(prev => {
      const schoolEvents = prev[schoolName] || [];
      return {
        ...prev,
        [schoolName]: [...schoolEvents, newEvent]
      };
    });
  };

  // --- NEW V2 ACTIONS ---
  const ensureSyncedPostExists = (schoolName, eventId, eventTitle) => {
    if (!currentUser) return;
    const syncPostId = `post-cal-${eventId}`;
    setPosts(prev => {
      if (prev.some(p => p.id === syncPostId)) return prev;

      const newSyncPost = {
        id: syncPostId,
        authorUid: 'system',
        authorName: '학사일정 알리미',
        category: '자유',
        title: `[학사일정] ${eventTitle}`,
        content: `[${schoolName}]의 학사일정 [${eventTitle}] 에 대한 학부모 익명 소통방입니다. 준비물, 학원 보강 일정 등 다양한 이야기를 나눠보세요.\n\n* 이 글은 학사 캘린더 일정과 실시간 연동됩니다.`,
        schoolName,
        region: currentUser.region || '반포동',
        type: 'school',
        likes: 3,
        likedBy: [],
        scraps: 1,
        scrapedBy: [],
        reports: 0,
        reportedBy: [],
        commentsCount: 0,
        isAiFlaged: false,
        isBanned: false,
        createdAt: new Date().toISOString(),
      };
      return [newSyncPost, ...prev];
    });
  };

  const addCalendarComment = (schoolName, eventId, eventTitle, content, grade) => {
    if (!currentUser) return;
    const syncPostId = `post-cal-${eventId}`;
    
    // Ensure synced post exists first
    ensureSyncedPostExists(schoolName, eventId, eventTitle);

    // Save as standard comment under syncPostId
    addComment(syncPostId, content, grade);

    // BOT REPLY SIMULATION (UTIL-02)
    // When the user posts a comment, trigger a bot reply after 2.5 seconds.
    setTimeout(() => {
      const botNames = ['반포초5 명랑한코끼리', '대치초3 명석한사자', '센텀초4 민첩한토끼', '대청중2 냉철한기린'];
      const botReplies = [
        '좋은 정보 공유해 주셔서 정말 감사합니다! 정보 찾아보고 있었는데 큰 도움이 되네요.',
        '저희 아이도 이번 학기 같이 보내는데 신경 쓸 게 참 많네요 ㅠㅠ 교재는 어떤 것 준비하시나요?',
        '이 일정 관련해서 다른 주말 학원 보강 스케줄도 다 조정해 두었습니다. 다들 파이팅입니다!',
        '학사 일정 대화방이 활성화되니 실시간 교차 정보 교환이 가능해서 마음이 한결 놓입니다.'
      ];

      const randomIdx = Math.floor(Math.random() * botNames.length);
      const botProfile = {
        uid: 'bot-user',
        pseudonym: botNames[randomIdx],
        grade: currentUser.grade || '5학년'
      };

      addComment(syncPostId, botReplies[randomIdx], botProfile.grade, botProfile);

      // Read current subscribed events inside timeout from fresh localstorage to avoid closure problems
      const freshSubscribed = JSON.parse(localStorage.getItem('edu_subscribed_events') || '[]');
      if (freshSubscribed.includes(eventId)) {
        const newNotif = {
          id: `notif-${Date.now()}`,
          eventId,
          eventTitle,
          text: `🔔 [${eventTitle}] 일정에 새 댓글이 등록되었습니다: "${botReplies[randomIdx].substring(0, 18)}..."`,
          time: new Date().toISOString(),
          unread: true
        };

        setNotifications(prev => [newNotif, ...prev]);
        setActiveNotification(newNotif);

        // Slide away after 4 seconds
        setTimeout(() => {
          setActiveNotification(null);
        }, 4000);
      }
    }, 2500);
  };

  const deleteCalendarComment = (commentId) => {
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, isBanned: true } : c));
  };

  const restoreCalendarComment = (commentId) => {
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, isBanned: false } : c));
  };

  const toggleSubscribeEvent = (eventId) => {
    setSubscribedEvents(prev => {
      const next = prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId];
      localStorage.setItem('edu_subscribed_events', JSON.stringify(next));
      return next;
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  // Helper inside context
  const updateUserPointsLocally = (uid, amount) => {
    setUsers(prev => prev.map(u => {
      if (u.uid === uid) {
        const nextPoints = Math.max(0, u.points + amount);
        return { ...u, points: nextPoints };
      }
      return u;
    }));
  };

  return (
    <AppStateContext.Provider value={{
      users,
      posts,
      comments,
      receipts,
      currentUser,
      customCalendarEvents,
      calendarComments,
      subscribedEvents,
      notifications,
      activeNotification,
      resetToFactoryDefaults,
      loginWithMockAccount,
      loginCustomEmail,
      logout,
      completeProfileSetup,
      createPost,
      deletePost,
      restorePost,
      toggleLikePost,
      toggleScrapPost,
      reportPost,
      votePoll,
      addComment,
      acceptComment,
      submitReceipt,
      approveReceipt,
      rejectReceipt,
      banUser,
      unbanUser,
      updateUserGrade,
      updateUserPoints,
      addCalendarEvent,
      ensureSyncedPostExists,
      addCalendarComment,
      deleteCalendarComment,
      restoreCalendarComment,
      toggleSubscribeEvent,
      clearNotifications,
      markNotificationsAsRead,
    }}>
      {children}
    </AppStateContext.Provider>
  );
};
