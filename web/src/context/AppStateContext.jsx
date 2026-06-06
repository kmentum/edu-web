import React, { createContext, useState, useEffect } from 'react';
import { mockUsers, mockPosts, mockComments, mockReceipts } from '../data/mockInitialData';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const AppStateContext = createContext();

// Helper to generate a random pseudonym based on region, school, grade
const generatePseudonym = (region, schoolName, grade) => {
  const adjectives = ['든든한', '영리한', '날렵한', '현명한', '자상한', '행복한', '명랑한', '신중한', '활기찬', '빛나는'];
  const nouns = ['올빼미', '돌고래', '표범', '부엉이', '독수리', '사자', '토끼', '기린', '코끼리', '호랑이'];
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  let schoolShort = '';
  if (schoolName) {
    schoolShort = schoolName.replace('서울', '').replace('광주', '').replace('부산', '').replace('대구', '');
    if (schoolShort.length > 5) {
      schoolShort = schoolShort.substring(0, 3) + schoolShort.slice(-2);
    }
  }
  
  const regionShort = region ? region.trim() : '전국';
  const gradeShort = grade ? grade.replace('학년', '') : '';
  
  return `${regionShort} ${schoolShort}${gradeShort} ${adj}${noun}`;
};

// Check for toxic words / ad content & teacher sniping (AI Filtering Simulation)
const runAIFilter = (title, content) => {
  const toxicKeywords = ['바보', '쓰레기', '광고', '선동', '벼락거지', '폭락', '폭등', '가짜', '사기', '개이득', '단톡방'];
  const foundKeywords = [];
  
  const checkText = `${title} ${content}`.toLowerCase();
  toxicKeywords.forEach(word => {
    if (checkText.includes(word)) {
      foundKeywords.push(word);
    }
  });

  // RSK-01: 실시간 교사 저격어 필터링
  const teacherKeywords = ['담임', '선생님', '선생', '교사'];
  const critiqueKeywords = ['저격', '고발', '민원', '짜증', '무능', '고소', '학대', '폭행', '막말', '쓰레기', '꼰대', '괴롭'];
  
  let isTeacherSniped = false;
  let foundTeacherWord = '';
  let foundCritiqueWord = '';

  teacherKeywords.forEach(tWord => {
    if (checkText.includes(tWord)) {
      critiqueKeywords.forEach(cWord => {
        if (checkText.includes(cWord)) {
          isTeacherSniped = true;
          foundTeacherWord = tWord;
          foundCritiqueWord = cWord;
        }
      });
    }
  });

  if (isTeacherSniped) {
    foundKeywords.push(`교사 저격 조합 우려: "${foundTeacherWord}" + "${foundCritiqueWord}"`);
  }
  
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

  // Global activeTab state for community feed (persistent across unmounts)
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('edu_active_tab');
    return saved || 'all';
  });

  useEffect(() => {
    localStorage.setItem('edu_active_tab', activeTab);
  }, [activeTab]);

  // School calendars data
  const [customCalendarEvents, setCustomCalendarEvents] = useState(() => {
    const saved = localStorage.getItem('edu_custom_calendar');
    return saved ? JSON.parse(saved) : {};
  });

  const calendarComments = comments.filter(c => c.postId && c.postId.startsWith('post-cal-'));

  const [subscribedEvents, setSubscribedEvents] = useState(() => {
    const saved = localStorage.getItem('edu_subscribed_events');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('edu_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeNotification, setActiveNotification] = useState(null);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // --- V1/V2 LOCALSTORAGE SYNCS (Only runs when Supabase is NOT active) ---
  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('edu_users', JSON.stringify(users));
    }
  }, [users]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('edu_posts', JSON.stringify(posts));
    }
  }, [posts]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('edu_comments', JSON.stringify(comments));
    }
  }, [comments]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('edu_receipts', JSON.stringify(receipts));
    }
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

  // --- SUPABASE AUTH SESSION LISTENER ---
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = session.user;
        
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Supabase 프로필 로드 실패:', error);
            return;
          }

          let dbUser = null;
          if (!profile) {
            // New user automatic setup
            const name = user.user_metadata?.full_name || '구글 사용자';
            const newProfile = {
              id: user.id,
              email: user.email || '',
              points: 1000,
              verified_academy: [],
              pseudonym: '',
              purchased_pdfs: []
            };
            
            const { error: insertErr } = await supabase
              .from('profiles')
              .insert(newProfile);

            if (insertErr) {
              console.error('Supabase 신규 프로필 생성 실패:', insertErr);
            } else {
              dbUser = {
                uid: user.id,
                email: user.email,
                name,
                schoolName: '',
                schoolLevel: '',
                grade: '',
                region: '',
                pseudonym: '',
                points: 1000,
                isBanned: false,
                verifiedAcademy: [],
                purchasedPdfs: [],
                createdAt: new Date().toISOString()
              };
            }
          } else {
            dbUser = {
              uid: profile.id,
              email: profile.email,
              name: user.user_metadata?.full_name || '구글 사용자',
              schoolName: profile.school_name || '',
              schoolLevel: profile.school_level || '',
              grade: profile.grade || '',
              region: profile.region || '',
              pseudonym: profile.pseudonym || '',
              points: profile.points,
              isBanned: profile.is_banned,
              verifiedAcademy: profile.verified_academy || [],
              purchasedPdfs: profile.purchased_pdfs || [],
              createdAt: profile.created_at
            };
          }

          if (dbUser) {
            setUsers(prev => {
              const exists = prev.some(u => u.uid === dbUser.uid);
              if (exists) {
                return prev.map(u => u.uid === dbUser.uid ? dbUser : u);
              }
              return [dbUser, ...prev];
            });
            setCurrentUser(dbUser);
          }
        } catch (err) {
          console.error('Supabase Auth 변경 처리 오류:', err);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isSupabaseConfigured]);

  // Synchronize current user status
  useEffect(() => {
    if (currentUser) {
      const freshUser = users.find(u => u.uid === currentUser.uid);
      if (freshUser) {
        if (freshUser.isBanned) {
          setCurrentUser(null);
          alert('해당 계정은 관리자에 의해 이용 정지(Ban)되었습니다.');
        } else if (JSON.stringify(freshUser) !== JSON.stringify(currentUser)) {
          setCurrentUser(freshUser);
        }
      }
    }
  }, [users, currentUser]);

  // --- SUPABASE DATA HYDRATION ---
  useEffect(() => {
    const fetchSupabaseData = async () => {
      if (!isSupabaseConfigured) return;

      try {
        // 1. Fetch profiles -> users
        const { data: profilesData } = await supabase.from('profiles').select('*');
        if (profilesData) {
          setUsers(profilesData.map(p => ({
            uid: p.id,
            email: p.email,
            schoolName: p.school_name || '',
            schoolLevel: p.school_level || '',
            grade: p.grade || '',
            region: p.region || '',
            pseudonym: p.pseudonym || '',
            points: p.points,
            isBanned: p.is_banned,
            verifiedAcademy: p.verified_academy || [],
            purchasedPdfs: p.purchased_pdfs || [],
            createdAt: p.created_at
          })));
        }

        // 2. Fetch posts
        const { data: postsData } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
        if (postsData) {
          setPosts(postsData.map(p => ({
            id: p.id,
            authorUid: p.author_uid,
            authorName: p.author_name,
            category: p.category,
            title: p.title,
            content: p.content,
            schoolName: p.school_name || '',
            region: p.region || '',
            type: p.type,
            likes: p.likes,
            likedBy: p.liked_by || [],
            scraps: p.scraps,
            scrapedBy: p.scraped_by || [],
            reports: p.reports,
            reportedBy: p.reported_by || [],
            commentsCount: p.comments_count,
            isAiFlaged: p.is_ai_flagged,
            aiFlagReason: p.ai_flag_reason || '',
            isBanned: p.is_banned,
            createdAt: p.created_at,
            hasReceiptBadge: p.has_receipt_badge,
            qnaPoints: p.qna_points,
            qnaResolved: p.qna_resolved,
            pollOptions: p.poll_options
          })));
        }

        // 3. Fetch comments
        const { data: commentsData } = await supabase.from('comments').select('*');
        if (commentsData) {
          setComments(commentsData.map(c => ({
            id: c.id,
            postId: c.post_id,
            authorUid: c.author_uid,
            authorName: c.author_name,
            content: c.content,
            createdAt: c.created_at,
            isAccepted: c.is_accepted,
            grade: c.grade || '',
            isBanned: c.is_banned
          })));
        }

        // 4. Fetch receipts
        const { data: receiptsData } = await supabase.from('receipts').select('*').order('created_at', { ascending: false });
        if (receiptsData) {
          setReceipts(receiptsData.map(r => ({
            id: r.id,
            userUid: r.user_uid,
            userName: r.user_name,
            userPseudonym: r.user_pseudonym,
            academyName: r.academy_name,
            date: r.date,
            amount: r.amount,
            amountStr: r.amount_str,
            ocrData: r.ocr_data || {},
            status: r.status,
            reviewerMemo: r.reviewer_memo || '',
            createdAt: r.created_at,
            reviewedAt: r.reviewed_at || ''
          })));
        }
      } catch (err) {
        console.error('Supabase 데이터 로드 실패:', err);
      }
    };

    fetchSupabaseData();
  }, [isSupabaseConfigured]);

  // RESET ALL DATA TO INITIAL STATS
  const resetToFactoryDefaults = async () => {
    if (window.confirm('모든 데이터를 초기 기본 상태로 리셋하시겠습니까?')) {
      if (isSupabaseConfigured) {
        try {
          // Clear Supabase tables
          await supabase.from('comments').delete().neq('id', '');
          await supabase.from('posts').delete().neq('id', '');
          await supabase.from('receipts').delete().neq('id', '');
          await supabase.from('profiles').delete().neq('id', '');
        } catch (err) {
          console.error('Supabase 데이터 초기화 실패:', err);
        }
      }
      localStorage.clear();
      setUsers(mockUsers);
      setPosts(mockPosts);
      setComments(mockComments);
      setReceipts(mockReceipts);
      setCurrentUser(null);
      setCustomCalendarEvents({});
      setSubscribedEvents([]);
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

  const loginCustomEmail = async (name, email) => {
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
    const newUid = `google-user-${Date.now()}`;
    const newUser = {
      uid: newUid,
      email,
      name,
      schoolName: '',
      schoolLevel: '',
      grade: '',
      region: '',
      pseudonym: '',
      points: 1000,
      isBanned: false,
      verifiedAcademy: [],
      purchasedPdfs: [],
      createdAt: new Date().toISOString(),
    };
    
    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').insert({
          id: newUid,
          email,
          points: 1000,
          verified_academy: [],
          purchased_pdfs: []
        });
      } catch (err) {
        console.error('Supabase 회원등록 실패:', err);
      }
    }

    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    return true;
  };

  const signUpWithEmail = async (name, email, password) => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: name
            }
          }
        });

        if (error) {
          alert(`회원가입 실패: ${error.message}`);
          return false;
        }

        if (data.user) {
          const { error: profileErr } = await supabase.from('profiles').insert({
            id: data.user.id,
            email: data.user.email,
            points: 1000,
            verified_academy: [],
            purchased_pdfs: []
          });
          if (profileErr && profileErr.code !== '23505') {
            console.error('Supabase 프로필 가산 실패:', profileErr);
            alert(`회원가입 실패 (프로필 DB 오류): ${profileErr.message} (코드: ${profileErr.code})`);
            return false;
          }
        }
        
        alert('회원가입 완료! 로그인을 진행해 주세요. (이메일 인증 메일이 발송되었을 수 있습니다)');
        return true;
      } catch (err) {
        console.error('Supabase 자체 회원가입 실패:', err);
        alert(`오류가 발생했습니다: ${err.message}`);
        return false;
      }
    } else {
      const existing = users.find(u => u.email === email);
      if (existing) {
        alert('이미 가입된 이메일 주소입니다.');
        return false;
      }

      const newUid = `user-${Date.now()}`;
      const newUser = {
        uid: newUid,
        email,
        password,
        name,
        schoolName: '',
        schoolLevel: '',
        grade: '',
        region: '',
        pseudonym: '',
        points: 1000,
        isBanned: false,
        verifiedAcademy: [],
        purchasedPdfs: [],
        createdAt: new Date().toISOString()
      };

      setUsers(prev => [newUser, ...prev]);
      setCurrentUser(newUser);
      alert('회원가입이 완료되었습니다! (데모 모드 자동 로그인)');
      return true;
    }
  };

  const loginWithEmail = async (email, password) => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          alert(`로그인 실패: ${error.message}`);
          return false;
        }
        return true;
      } catch (err) {
        console.error('Supabase 로그인 에러:', err);
        alert(`로그인 오류: ${err.message}`);
        return false;
      }
    } else {
      const target = users.find(u => u.email === email);
      if (!target) {
        alert('등록되지 않은 이메일 주소입니다.');
        return false;
      }
      if (target.password && target.password !== password) {
        alert('비밀번호가 일치하지 않습니다.');
        return false;
      }
      if (target.isBanned) {
        alert('이 계정은 이용정지(Ban) 상태입니다.');
        return false;
      }
      setCurrentUser(target);
      return true;
    }
  };

  // Google OAuth actual Sign In
  const loginWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      alert('Supabase 환경 변수가 설정되지 않았습니다. 로컬 시뮬레이션 로그인을 이용해 주세요.');
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error('Google 로그인 오류:', err);
      alert(`구글 로그인 실패: ${err.message}`);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Supabase 로그아웃 오류:', err);
      }
    }
    setCurrentUser(null);
  };

  const completeProfileSetup = async (schoolName, schoolLevel, grade, region) => {
    if (!currentUser) return;
    
    const pseudonym = generatePseudonym(region, schoolName, grade);
    
    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').update({
          school_name: schoolName,
          school_level: schoolLevel,
          grade,
          region,
          pseudonym
        }).eq('id', currentUser.uid);
      } catch (err) {
        console.error('Supabase 프로필 업데이트 실패:', err);
      }
    }

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
  const createPost = async (title, content, category, type, options = {}) => {
    if (!currentUser) return null;

    const filterResult = runAIFilter(title, content);
    const newPostId = `post-${Date.now()}`;

    const newPost = {
      id: newPostId,
      authorUid: currentUser.uid,
      authorName: currentUser.pseudonym || '익명 학부모',
      category,
      title,
      content,
      schoolName: currentUser.schoolName,
      region: currentUser.region,
      type,
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

    if (newPost.qnaPoints > 0) {
      if (currentUser.points < newPost.qnaPoints) {
        alert('포인트가 부족하여 Q&A 채택 포인트를 설정할 수 없습니다.');
        return null;
      }
      updateUserPointsLocally(currentUser.uid, -newPost.qnaPoints);
    }

    if (isSupabaseConfigured) {
      try {
        await supabase.from('posts').insert({
          id: newPostId,
          author_uid: newPost.authorUid,
          author_name: newPost.authorName,
          category: newPost.category,
          title: newPost.title,
          content: newPost.content,
          school_name: newPost.schoolName,
          region: newPost.region,
          type: newPost.type,
          is_ai_flagged: newPost.isAiFlaged,
          ai_flag_reason: newPost.aiFlagReason,
          has_receipt_badge: newPost.hasReceiptBadge,
          qna_points: newPost.qnaPoints,
          poll_options: newPost.pollOptions
        });
      } catch (err) {
        console.error('Supabase 포스트 업로드 실패:', err);
      }
    }

    setPosts(prev => [newPost, ...prev]);
    return newPost;
  };

  const deletePost = async (postId) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('posts').update({ is_banned: true }).eq('id', postId);
      } catch (err) {
        console.error('Supabase 포스트 밴 실패:', err);
      }
    }
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, isBanned: true } : p));
  };

  const restorePost = async (postId) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('posts').update({ is_banned: false, is_ai_flagged: false, reports: 0, reported_by: [] }).eq('id', postId);
      } catch (err) {
        console.error('Supabase 포스트 복구 실패:', err);
      }
    }
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, isAiFlaged: false, isBanned: false, reports: 0, reportedBy: [] } : p));
  };

  const toggleLikePost = async (postId) => {
    if (!currentUser) return;
    
    let nextLikedBy = [];
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const hasLiked = p.likedBy.includes(currentUser.uid);
        nextLikedBy = hasLiked 
          ? p.likedBy.filter(uid => uid !== currentUser.uid) 
          : [...p.likedBy, currentUser.uid];
        return { ...p, likes: nextLikedBy.length, likedBy: nextLikedBy };
      }
      return p;
    }));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('posts').update({
          likes: nextLikedBy.length,
          liked_by: nextLikedBy
        }).eq('id', postId);
      } catch (err) {
        console.error('Supabase 좋아요 업데이트 실패:', err);
      }
    }
  };

  const toggleScrapPost = async (postId) => {
    if (!currentUser) return;

    let nextScrapedBy = [];
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const hasScraped = p.scrapedBy.includes(currentUser.uid);
        nextScrapedBy = hasScraped 
          ? p.scrapedBy.filter(uid => uid !== currentUser.uid) 
          : [...p.scrapedBy, currentUser.uid];
        return { ...p, scraps: nextScrapedBy.length, scrapedBy: nextScrapedBy };
      }
      return p;
    }));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('posts').update({
          scraps: nextScrapedBy.length,
          scraped_by: nextScrapedBy
        }).eq('id', postId);
      } catch (err) {
        console.error('Supabase 스크랩 업데이트 실패:', err);
      }
    }
  };

  const reportPost = async (postId, reason) => {
    if (!currentUser) return;
    
    let updatedPost = null;
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        if (p.reportedBy.includes(currentUser.uid)) {
          alert('이미 신고한 게시글입니다.');
          return p;
        }
        const reportedBy = [...p.reportedBy, currentUser.uid];
        const reports = reportedBy.length;
        const isAiFlaged = p.isAiFlaged || reports >= 3;
        const aiFlagReason = p.isAiFlaged 
          ? p.aiFlagReason 
          : (reports >= 3 ? '사용자 누적 신고 3회 이상' : p.aiFlagReason);
        
        updatedPost = { ...p, reports, reportedBy, isAiFlaged, aiFlagReason };
        alert('신고가 접수되었습니다. 관리자 확인 후 처리됩니다.');
        return updatedPost;
      }
      return p;
    }));

    if (isSupabaseConfigured && updatedPost) {
      try {
        await supabase.from('posts').update({
          reports: updatedPost.reports,
          reported_by: updatedPost.reportedBy,
          is_ai_flagged: updatedPost.isAiFlaged,
          ai_flag_reason: updatedPost.aiFlagReason
        }).eq('id', postId);
      } catch (err) {
        console.error('Supabase 신고 업데이트 실패:', err);
      }
    }
  };

  const votePoll = async (postId, optionIndex) => {
    if (!currentUser) return;
    
    let updatedPoll = null;
    setPosts(prev => prev.map(p => {
      if (p.id === postId && p.pollOptions) {
        updatedPoll = p.pollOptions.map((opt, idx) => {
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

    if (isSupabaseConfigured && updatedPoll) {
      try {
        await supabase.from('posts').update({
          poll_options: updatedPoll
        }).eq('id', postId);
      } catch (err) {
        console.error('Supabase 투표 갱신 실패:', err);
      }
    }
  };

  // 4. Comments & Q&A
  const addComment = async (postId, content, grade = null, authorOverrides = null) => {
    if (!currentUser) return;
    const newCommentId = `comment-${Date.now()}`;
    const newComment = {
      id: newCommentId,
      postId,
      authorUid: authorOverrides ? authorOverrides.uid : currentUser.uid,
      authorName: authorOverrides ? authorOverrides.pseudonym : (currentUser.pseudonym || '익명 학부모'),
      content,
      createdAt: new Date().toISOString(),
      isAccepted: false,
      grade: grade || (postId.startsWith('post-cal-') ? (authorOverrides ? authorOverrides.grade : currentUser.grade) : null),
      isBanned: false
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('comments').insert({
          id: newCommentId,
          post_id: postId,
          author_uid: newComment.authorUid,
          author_name: newComment.authorName,
          content,
          grade: newComment.grade
        });

        const targetPost = posts.find(p => p.id === postId);
        if (targetPost) {
          await supabase.from('posts').update({
            comments_count: targetPost.commentsCount + 1
          }).eq('id', postId);
        }
      } catch (err) {
        console.error('Supabase 댓글 추가 실패:', err);
      }
    }

    setComments(prev => [...prev, newComment]);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p));
    return newComment;
  };

  const acceptComment = async (postId, commentId) => {
    if (!currentUser) return;
    
    const post = posts.find(p => p.id === postId);
    if (!post || post.authorUid !== currentUser.uid || post.qnaResolved) return;

    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    if (isSupabaseConfigured) {
      try {
        await supabase.from('comments').update({ is_accepted: true }).eq('id', commentId);
        await supabase.from('posts').update({ qna_resolved: true }).eq('id', postId);
      } catch (err) {
        console.error('Supabase 채택 업데이트 실패:', err);
      }
    }

    setComments(prev => prev.map(c => c.id === commentId ? { ...c, isAccepted: true } : c));
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, qnaResolved: true } : p));

    if (post.qnaPoints > 0) {
      updateUserPointsLocally(comment.authorUid, post.qnaPoints);
      alert(`답변이 채택되었습니다! 작성자에게 ${post.qnaPoints}P가 지급되었습니다.`);
    }
  };

  // 5. OCR & Receipt Authentication
  const submitReceipt = async (academyName, date, amountStr, templateId) => {
    if (!currentUser) return;

    const numericAmount = parseInt(amountStr.replace(/[^0-9]/g, '')) || 0;

    // OCR 텍스트 조합 (학원명 + 결제일시 + 결제금액) 중복 검사 (RSK-04 확장)
    const isDuplicate = receipts.some(r => 
      r.academyName.trim() === academyName.trim() && 
      r.date.trim() === date.trim() && 
      r.amount === numericAmount
    );

    if (isDuplicate) {
      alert('⚠️ 어뷰징 방지 경고:\n이미 등록되었거나 심사 대기 중인 동일한 영수증 내역(학원명, 결제일시, 금액 일치)이 존재합니다.');
      return;
    }

    const newReceiptId = `rcpt-${Date.now()}`;
    
    const newReceipt = {
      id: newReceiptId,
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

    if (isSupabaseConfigured) {
      try {
        await supabase.from('receipts').insert({
          id: newReceiptId,
          user_uid: newReceipt.userUid,
          user_name: newReceipt.userName,
          user_pseudonym: newReceipt.userPseudonym,
          academy_name: newReceipt.academyName,
          date: newReceipt.date,
          amount: newReceipt.amount,
          amount_str: newReceipt.amountStr,
          ocr_data: newReceipt.ocrData
        });
      } catch (err) {
        console.error('Supabase 영수증 제출 실패:', err);
      }
    }

    setReceipts(prev => [newReceipt, ...prev]);
    alert('영수증 인증 검증 요청이 전송되었습니다. 관리자 승인 후 확인 가능합니다.');
  };

  // 6. Admin Panel Modifiers
  const approveReceipt = async (receiptId) => {
    const rcpt = receipts.find(r => r.id === receiptId);
    if (!rcpt) return;

    const targetUser = users.find(u => u.uid === rcpt.userUid);
    const currentAcademies = targetUser ? (targetUser.verifiedAcademy || []) : [];
    const nextAcademies = currentAcademies.includes(rcpt.academyName) ? currentAcademies : [...currentAcademies, rcpt.academyName];
    const nextPoints = (targetUser ? targetUser.points : 0) + 5000;

    if (isSupabaseConfigured) {
      try {
        await supabase.from('receipts').update({
          status: 'approved',
          reviewer_memo: '관리자 최종 승인 완료',
          reviewed_at: new Date().toISOString()
        }).eq('id', receiptId);

        await supabase.from('profiles').update({
          points: nextPoints,
          verified_academy: nextAcademies
        }).eq('id', rcpt.userUid);
      } catch (err) {
        console.error('Supabase 영수증 승인 실패:', err);
      }
    }

    setReceipts(prev => prev.map(r => r.id === receiptId ? { ...r, status: 'approved', reviewedAt: new Date().toISOString(), reviewerMemo: '관리자 최종 승인 완료' } : r));
    
    setUsers(prev => prev.map(u => {
      if (u.uid === rcpt.userUid) {
        return {
          ...u,
          points: nextPoints,
          verifiedAcademy: nextAcademies
        };
      }
      return u;
    }));
  };

  const rejectReceipt = async (receiptId, memo) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('receipts').update({
          status: 'rejected',
          reviewer_memo: memo || '서류 불충분으로 반려',
          reviewed_at: new Date().toISOString()
        }).eq('id', receiptId);
      } catch (err) {
        console.error('Supabase 영수증 반려 실패:', err);
      }
    }
    setReceipts(prev => prev.map(r => r.id === receiptId ? { ...r, status: 'rejected', reviewedAt: new Date().toISOString(), reviewerMemo: memo || '서류 불충분으로 반려' } : r));
  };

  const banUser = async (uid) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').update({ is_banned: true }).eq('id', uid);
      } catch (err) {
        console.error('Supabase 유저 밴 실패:', err);
      }
    }
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isBanned: true } : u));
  };

  const unbanUser = async (uid) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').update({ is_banned: false }).eq('id', uid);
      } catch (err) {
        console.error('Supabase 유저 밴 해제 실패:', err);
      }
    }
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, isBanned: false } : u));
  };

  const deleteUser = async (uid) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').delete().eq('id', uid);
      } catch (err) {
        console.error('Supabase 유저 삭제 실패:', err);
      }
    }
    setUsers(prev => prev.filter(u => u.uid !== uid));
    if (currentUser && currentUser.uid === uid) {
      setCurrentUser(null);
    }
  };

  const updateUserGrade = async (uid, newGrade) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').update({ grade: newGrade }).eq('id', uid);
      } catch (err) {
        console.error('Supabase 학년 업데이트 실패:', err);
      }
    }
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, grade: newGrade } : u));
  };

  const updateUserPoints = async (uid, deltaPoints) => {
    updateUserPointsLocally(uid, deltaPoints);
  };

  const addCalendarEvent = (schoolName, title, date, type, memo) => {
    const newEvent = {
      id: `cal-custom-${Date.now()}`,
      title,
      date,
      type,
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

  const ensureSyncedPostExists = async (schoolName, eventId, eventTitle) => {
    if (!currentUser) return;
    const syncPostId = `post-cal-${eventId}`;
    
    const exists = posts.some(p => p.id === syncPostId);
    if (exists) return;

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
      likes: 0,
      likedBy: [],
      scraps: 0,
      scrapedBy: [],
      reports: 0,
      reportedBy: [],
      commentsCount: 0,
      isAiFlaged: false,
      isBanned: false,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('posts').insert({
          id: syncPostId,
          author_uid: newSyncPost.authorUid,
          author_name: newSyncPost.authorName,
          category: newSyncPost.category,
          title: newSyncPost.title,
          content: newSyncPost.content,
          school_name: newSyncPost.schoolName,
          region: newSyncPost.region,
          type: newSyncPost.type,
          likes: newSyncPost.likes
        });
      } catch (err) {
        console.error('Supabase 학사 포스트 추가 실패:', err);
      }
    }

    setPosts(prev => [newSyncPost, ...prev]);
  };

  const addCalendarComment = (schoolName, eventId, eventTitle, content, grade) => {
    if (!currentUser) return;
    const syncPostId = `post-cal-${eventId}`;
    
    ensureSyncedPostExists(schoolName, eventId, eventTitle);
    addComment(syncPostId, content, grade);
  };

  const deleteCalendarComment = async (commentId) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('comments').update({ is_banned: true }).eq('id', commentId);
      } catch (err) {
        console.error('Supabase 댓글 밴 실패:', err);
      }
    }
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, isBanned: true } : c));
  };

  const deleteComment = deleteCalendarComment;

  const restoreCalendarComment = async (commentId) => {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('comments').update({ is_banned: false }).eq('id', commentId);
      } catch (err) {
        console.error('Supabase 댓글 복구 실패:', err);
      }
    }
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, isBanned: false } : c));
  };

  const toggleSubscribeEvent = (schoolName, eventId, eventTitle) => {
    const isSubscribing = !subscribedEvents.includes(eventId);
    if (isSubscribing) {
      ensureSyncedPostExists(schoolName, eventId, eventTitle);
    }
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

  const updateUserPointsLocally = async (uid, amount) => {
    const targetUser = users.find(u => u.uid === uid);
    const nextPoints = Math.max(0, (targetUser ? targetUser.points : 0) + amount);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').update({ points: nextPoints }).eq('id', uid);
      } catch (err) {
        console.error('Supabase 포인트 갱신 실패:', err);
      }
    }

    setUsers(prev => prev.map(u => {
      if (u.uid === uid) {
        return { ...u, points: nextPoints };
      }
      return u;
    }));
  };

  const purchasePdf = async (pdfId, pricePoints) => {
    if (!currentUser) return false;

    const alreadyPurchased = (currentUser.purchasedPdfs || []).includes(pdfId);
    if (alreadyPurchased) {
      alert('이미 구매한 자료입니다.');
      return false;
    }

    if (currentUser.points < pricePoints) {
      alert(`보유하신 포인트(${currentUser.points}P)가 부족합니다. 영수증을 인증해 포인트를 충전해 주세요.`);
      return false;
    }

    const nextPoints = currentUser.points - pricePoints;
    const nextPurchased = [...(currentUser.purchasedPdfs || []), pdfId];

    if (isSupabaseConfigured) {
      try {
        await supabase.from('profiles').update({
          points: nextPoints,
          purchased_pdfs: nextPurchased
        }).eq('id', currentUser.uid);
      } catch (err) {
        console.error('Supabase PDF 구매 실패:', err);
      }
    }

    setUsers(prev => prev.map(u => {
      if (u.uid === currentUser.uid) {
        return { ...u, points: nextPoints, purchasedPdfs: nextPurchased };
      }
      return u;
    }));

    setCurrentUser(prev => ({
      ...prev,
      points: nextPoints,
      purchasedPdfs: nextPurchased
    }));

    return true;
  };

  return (
    <AppStateContext.Provider value={{
      users,
      posts,
      comments,
      receipts,
      currentUser,
      customCalendarEvents,
      activeTab,
      setActiveTab,
      calendarComments,
      subscribedEvents,
      notifications,
      activeNotification,
      showNotifDropdown,
      setShowNotifDropdown,
      resetToFactoryDefaults,
      loginWithMockAccount,
      loginCustomEmail,
      signUpWithEmail,
      loginWithEmail,
      loginWithGoogle,
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
      deleteUser,
      updateUserGrade,
      updateUserPoints,
      addCalendarEvent,
      ensureSyncedPostExists,
      addCalendarComment,
      deleteCalendarComment,
      restoreCalendarComment,
      deleteComment,
      toggleSubscribeEvent,
      clearNotifications,
      markNotificationsAsRead,
      purchasePdf,
    }}>
      {children}
    </AppStateContext.Provider>
  );
};
