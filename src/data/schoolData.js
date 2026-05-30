// Mock schools and regions data with representative academic calendar details.

export const mockSchools = [
  { id: 'sch-01', name: '서울반포초등학교', level: '초등', region: '반포동' },
  { id: 'sch-02', name: '서울대치초등학교', level: '초등', region: '대치동' },
  { id: 'sch-03', name: '부산센텀초등학교', level: '초등', region: '우동' },
  { id: 'sch-04', name: '대구범어초등학교', level: '초등', region: '범어동' },
  { id: 'sch-05', name: '광주봉선초등학교', level: '초등', region: '봉선동' },
  { id: 'sch-06', name: '서울대청중학교', level: '중등', region: '대치동' },
  { id: 'sch-07', name: '서울반포중학교', level: '중등', region: '반포동' },
  { id: 'sch-08', name: '대치고등학교', level: '고등', region: '대치동' },
  { id: 'sch-09', name: '반포고등학교', level: '고등', region: '반포동' },
];

export const mockRegions = [
  '대치동',
  '반포동',
  '개포동',
  '도곡동',
  '압구정동',
  '우동',
  '범어동',
  '봉선동',
  '목동',
  '서초동',
];

// Predefined mock academic calendars per school for representative schedules.
export const mockAcademicCalendars = {
  '서울반포초등학교': [
    { id: 'cal-bp-01', date: '2026-06-03', title: '개교기념일 (휴업)', type: 'holiday', memo: '반포초 개교 52주년 기념 휴업일' },
    { id: 'cal-bp-02', date: '2026-06-15', title: '1학기 학부모 공개수업', type: 'event', memo: '3~4학년 학부모 대상 교실 참관 (10:00~)' },
    { id: 'cal-bp-03', date: '2026-06-25', title: '현장체험학습 (에버랜드)', type: 'event', memo: '5학년 현장체험학습, 도시락 준비 필요' },
    { id: 'cal-bp-04', date: '2026-07-08', title: '1학기 과정 중심 평가', type: 'exam', memo: '국어, 수학, 과학 지필 및 수행 평가 합산 주간' },
    { id: 'cal-bp-05', date: '2026-07-24', title: '1학기 방학식', type: 'holiday', memo: '급식 미실시, 11:30 하교' },
    { id: 'cal-bp-06', date: '2026-08-25', title: '2학기 개학식', type: 'event', memo: '정상 등교 및 교과 수업 시작' }
  ],
  '서울대치초등학교': [
    { id: 'cal-dc-01', date: '2026-06-05', title: '재량휴업일', type: 'holiday', memo: '현충일 징검다리 휴무로 인한 재량휴업' },
    { id: 'cal-dc-02', date: '2026-06-19', title: '진로 직업 체험의 날', type: 'event', memo: '학부모 일일 명예교사 초청 직업 특강' },
    { id: 'cal-dc-03', date: '2026-07-02', title: '수학 학업 성취도 평가', type: 'exam', memo: '전학년 단원평가 및 창의사고력 진단평가' },
    { id: 'cal-dc-04', date: '2026-07-22', title: '1학기 여름방학식', type: 'holiday', memo: '급식 실시 후 13:00 하교' },
    { id: 'cal-dc-05', date: '2026-08-24', title: '2학기 개학식', type: 'event', memo: '여름방학 과제물 수거 및 교과서 배부' }
  ],
  '부산센텀초등학교': [
    { id: 'cal-ct-01', date: '2026-06-11', title: '센텀 한마음 체육대회', type: 'event', memo: '청백전 운동회, 학부모 참여 계수 및 릴레이 경기 포함' },
    { id: 'cal-ct-02', date: '2026-06-23', title: '소방대피 합동훈련', type: 'event', memo: '해운대소방서 합동 대피 시뮬레이션 및 안전 교육' },
    { id: 'cal-ct-03', date: '2026-07-07', title: '영어 스피치 대회', type: 'event', memo: '교내 영어 듣기/말하기 대회 (4~6학년 대상)' },
    { id: 'cal-ct-04', date: '2026-07-24', title: '여름방학식', type: 'holiday', memo: '여름철 물놀이 안전사고 교육 후 하교' },
    { id: 'cal-ct-05', date: '2026-08-28', title: '2학기 개학식', type: 'event', memo: '방학 생활 기록부 제출' }
  ],
  'default': [
    { id: 'cal-df-01', date: '2026-06-05', title: '임시재량휴업일', type: 'holiday', memo: '학교 재량에 따른 단기 휴업일' },
    { id: 'cal-df-02', date: '2026-06-15', title: '소방대피 안전훈련', type: 'event', memo: '재난 대비 안전 교육 주간' },
    { id: 'cal-df-03', date: '2026-07-06', title: '기말 학업성취도 평가', type: 'exam', memo: '학기말 교과성취도 진단' },
    { id: 'cal-df-04', date: '2026-07-24', title: '여름방학식', type: 'holiday', memo: '여름방학 시작 (급식 미실시)' },
    { id: 'cal-df-05', date: '2026-08-25', title: '2학기 개학식', type: 'event', memo: '2학기 등교 시작' }
  ]
};
