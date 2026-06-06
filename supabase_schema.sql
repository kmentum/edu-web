-- SchoolEdu Supabase PostgreSQL Database Schema (Phase 1 MVP)
-- 복사하여 Supabase SQL Editor에 붙여넣고 실행(Run)하시면 필요한 테이블들이 자동 생성됩니다.

-- 1. 학부모 회원 프로필 테이블 (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY, -- Firebase Auth UID 또는 Google UID 매핑
  email TEXT UNIQUE NOT NULL,
  school_name TEXT,
  school_level TEXT,
  grade TEXT,
  region TEXT,
  pseudonym TEXT,
  points INTEGER DEFAULT 1000,
  is_banned BOOLEAN DEFAULT FALSE,
  verified_academy TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. 커뮤니티 게시글 테이블 (posts)
CREATE TABLE IF NOT EXISTS public.posts (
  id TEXT PRIMARY KEY,
  author_uid TEXT NOT NULL,
  author_name TEXT NOT NULL,
  category TEXT NOT NULL, -- '자유', '질문', '리뷰'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  school_name TEXT,
  region TEXT,
  type TEXT NOT NULL, -- 'school', 'region', 'all'
  likes INTEGER DEFAULT 0,
  liked_by TEXT[] DEFAULT '{}',
  scraps INTEGER DEFAULT 0,
  scraped_by TEXT[] DEFAULT '{}',
  reports INTEGER DEFAULT 0,
  reported_by TEXT[] DEFAULT '{}',
  comments_count INTEGER DEFAULT 0,
  is_ai_flagged BOOLEAN DEFAULT FALSE,
  ai_flag_reason TEXT,
  is_banned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  has_receipt_badge BOOLEAN DEFAULT FALSE,
  qna_points INTEGER DEFAULT 0,
  qna_resolved BOOLEAN DEFAULT FALSE,
  poll_options JSONB DEFAULT NULL -- 투표 항목 리스트
);

-- 3. 게시글 및 학사일정 통합 댓글 테이블 (comments)
CREATE TABLE IF NOT EXISTS public.comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  author_uid TEXT NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  is_accepted BOOLEAN DEFAULT FALSE,
  grade TEXT,
  is_banned BOOLEAN DEFAULT FALSE
);

-- 4. 학원 영수증 인증 내역 테이블 (receipts)
CREATE TABLE IF NOT EXISTS public.receipts (
  id TEXT PRIMARY KEY,
  user_uid TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_pseudonym TEXT NOT NULL,
  academy_name TEXT NOT NULL,
  date TEXT NOT NULL,
  amount INTEGER DEFAULT 0,
  amount_str TEXT NOT NULL,
  ocr_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewer_memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 5. MVP 단계 개발 편의를 위한 테이블 RLS(행 보안) 임시 비활성화 처리
-- (실제 상용 배포 단계에서는 활성화 후 정밀 Policy를 설정해야 합니다.)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts DISABLE ROW LEVEL SECURITY;
