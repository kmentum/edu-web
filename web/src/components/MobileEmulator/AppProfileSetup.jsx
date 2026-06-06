import React, { useContext, useState, useEffect } from 'react';
import { AppStateContext } from '../../context/AppStateContext';
import { mockSchools, mockRegions } from '../../data/schoolData';

export const AppProfileSetup = ({ onNavigate }) => {
  const { currentUser, completeProfileSetup } = useContext(AppStateContext);

  const [regionInput, setRegionInput] = useState('');
  const [schoolInput, setSchoolInput] = useState('');
  const [gradeInput, setGradeInput] = useState('1학년');
  const [schoolLevel, setSchoolLevel] = useState('초등');

  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  
  const [nicknameInput, setNicknameInput] = useState('');
  const [isNickCustomized, setIsNickCustomized] = useState(false);
  
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [filteredRegions, setFilteredRegions] = useState([]);

  // Handle region input search
  useEffect(() => {
    if (regionInput.trim() === '') {
      setFilteredRegions(mockRegions);
    } else {
      setFilteredRegions(
        mockRegions.filter(r => r.includes(regionInput.trim()))
      );
    }
  }, [regionInput]);

  // Handle school input search
  useEffect(() => {
    if (schoolInput.trim() === '') {
      setFilteredSchools(mockSchools);
    } else {
      setFilteredSchools(
        mockSchools.filter(s => s.name.includes(schoolInput.trim()))
      );
    }
  }, [schoolInput]);

  // Auto detect school level (초등, 중등, 고등) when school is selected
  const handleSelectSchool = (schoolName) => {
    setSchoolInput(schoolName);
    setShowSchoolDropdown(false);
    
    const matched = mockSchools.find(s => s.name === schoolName);
    if (matched) {
      setSchoolLevel(matched.level);
      // Auto fill region if school has it
      if (matched.region) {
        setRegionInput(matched.region);
      }
    }
  };

  const handleSelectRegion = (regionName) => {
    setRegionInput(regionName);
    setShowRegionDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!regionInput.trim() || !schoolInput.trim()) {
      alert('우리 동네(지역)와 학교명을 입력해 주세요.');
      return;
    }
    if (!nicknameInput.trim()) {
      alert('가명 닉네임을 입력해 주세요.');
      return;
    }

    completeProfileSetup(schoolInput.trim(), schoolLevel, gradeInput, regionInput.trim(), nicknameInput.trim());
    onNavigate('feed');
  };

  // Auto-generate customized/pseudonym nickname but allow customization
  useEffect(() => {
    if (!isNickCustomized && regionInput && schoolInput) {
      const shortSchool = schoolInput.replace('서울', '').replace('광주', '').replace('부산', '').replace('대구', '');
      const gradeShort = gradeInput.replace('학년', '');
      
      const adjectives = ['든든한', '영리한', '날렵한', '현명한', '자상한', '행복한', '명랑한', '신중한', '활기찬', '빛나는'];
      const nouns = ['올빼미', '돌고래', '표범', '부엉이', '독수리', '사자', '토끼', '기린', '코끼리', '호랑이'];
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      
      const regionShort = regionInput ? regionInput.trim() : '전국';
      setNicknameInput(`${regionShort} ${shortSchool.substring(0,4)}${gradeShort} ${adj}${noun}`);
    }
  }, [regionInput, schoolInput, gradeInput, isNickCustomized]);

  return (
    <div className="mobile-profile-setup-screen animate-slide-up">
      <div className="setup-title">
        <h3>자녀 정보 & 가명 프로필 설정</h3>
        <p>익명 커뮤니티 활동을 위해 자녀 정보를 입력해주세요. 구글 실명은 철저히 숨겨지며 가명 닉네임이 고정 부여됩니다.</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-custom-form" style={{ gap: '16px' }}>
        
        {/* Region Input */}
        <div className="input-group" style={{ position: 'relative' }}>
          <label className="input-label">우리 동네 (지역 법정동)</label>
          <input
            type="text"
            className="text-input"
            placeholder="예: 대치동, 반포동 (직접 입력 가능)"
            value={regionInput}
            onChange={(e) => {
              setRegionInput(e.target.value);
              setShowRegionDropdown(true);
            }}
            onFocus={() => setShowRegionDropdown(true)}
            onBlur={() => setTimeout(() => setShowRegionDropdown(false), 200)}
          />
          {showRegionDropdown && filteredRegions.length > 0 && (
            <div className="school-search-results">
              {filteredRegions.map(reg => (
                <div 
                  key={reg} 
                  className="search-item"
                  onMouseDown={() => handleSelectRegion(reg)}
                >
                  📍 {reg}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* School Input */}
        <div className="input-group" style={{ position: 'relative' }}>
          <label className="input-label">자녀 학교명</label>
          <input
            type="text"
            className="text-input"
            placeholder="예: 반포초등학교 (직접 입력 가능)"
            value={schoolInput}
            onChange={(e) => {
              setSchoolInput(e.target.value);
              setShowSchoolDropdown(true);
            }}
            onFocus={() => setShowSchoolDropdown(true)}
            onBlur={() => setTimeout(() => setShowSchoolDropdown(false), 200)}
          />
          {showSchoolDropdown && filteredSchools.length > 0 && (
            <div className="school-search-results">
              {filteredSchools.map(sch => (
                <div 
                  key={sch.id} 
                  className="search-item"
                  onMouseDown={() => handleSelectSchool(sch.name)}
                >
                  🏫 {sch.name} ({sch.level})
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Grade Selection */}
        <div className="input-group">
          <label className="input-label">자녀 학년</label>
          <select 
            className="text-input"
            value={gradeInput}
            onChange={(e) => setGradeInput(e.target.value)}
          >
            {schoolLevel === '초등' ? (
              <>
                <option value="1학년">초등 1학년</option>
                <option value="2학년">초등 2학년</option>
                <option value="3학년">초등 3학년</option>
                <option value="4학년">초등 4학년</option>
                <option value="5학년">초등 5학년</option>
                <option value="6학년">초등 6학년</option>
              </>
            ) : schoolLevel === '중등' ? (
              <>
                <option value="1학년">중등 1학년</option>
                <option value="2학년">중등 2학년</option>
                <option value="3학년">중등 3학년</option>
              </>
            ) : (
              <>
                <option value="1학년">고등 1학년</option>
                <option value="2학년">고등 2학년</option>
                <option value="3학년">고등 3학년</option>
              </>
            )}
          </select>
        </div>

        {/* Customizable Pseudonym Input */}
        <div className="input-group">
          <label className="input-label" style={{ color: 'var(--primary)', fontWeight: '700' }}>
            생성 가명 닉네임 (자동 생성 후 수정 가능)
          </label>
          <input 
            type="text"
            className="text-input"
            style={{ fontWeight: '700', color: 'var(--primary)' }}
            value={nicknameInput}
            onChange={(e) => {
              setNicknameInput(e.target.value);
              setIsNickCustomized(true);
            }}
            placeholder="동네와 학교 입력 시 닉네임이 자동 조합됩니다"
          />
          <p style={{ fontSize: '0.65rem', color: 'var(--neutral-muted)', marginTop: '2px' }}>
            * 지역/학교/학년 변경 시 닉네임이 자동 조합 추천되나, 직접 마음에 드는 닉네임으로 자유롭게 커스텀 수정할 수 있습니다.
          </p>
        </div>

        <button type="submit" className="submit-btn" style={{ marginTop: '10px', padding: '12px' }}>
          프로필 저장 및 홈 입장
        </button>
      </form>
    </div>
  );
};
export default AppProfileSetup;
