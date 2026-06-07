// hak.cle Pseudonym Region Masking Utility (RSK-03)
// 전국 광장 피드 등에서 동네 노출로 인한 서열화 방지를 위해 법정동 주소를 구/군 단위로 마스킹합니다.

const dongToGuMap = {
  '반포동': '서초구',
  '대치동': '강남구',
  '개포동': '강남구',
  '압구정동': '강남구',
  '도곡동': '강남구',
  '우동': '해운대구',
  '좌동': '해운대구',
  '중동': '해운대구',
  '목동': '양천구',
  '분당동': '분당구',
  '정자동': '분당구',
  '삼평동': '분당구',
  '서초동': '서초구',
  '잠실동': '송파구',
  '방이동': '송파구',
  '신정동': '양천구',
  '여의도동': '영등포구',
  '상계동': '노원구',
  '중계동': '노원구'
};

/**
 * 닉네임 내 법정동을 구/군 단위로 마스킹 처리합니다.
 * @param {string} pseudonym - 예: "서울 반포동 반포초5 든든한올빼미"
 * @returns {string} 마스킹 처리된 닉네임 - 예: "서울 서초구 반포초5 든든한올빼미"
 */
export const maskPseudonym = (pseudonym) => {
  if (!pseudonym) return pseudonym;

  const parts = pseudonym.trim().split(/\s+/);
  // 형식: [시/도] [법정동] [학교명학년] [닉네임형용사+명사]
  // 예: ["서울", "반포동", "반포초5", "든든한올빼미"]
  if (parts.length >= 2) {
    const regionName = parts[1];
    
    if (dongToGuMap[regionName]) {
      parts[1] = dongToGuMap[regionName];
    } else if (regionName.endsWith('동')) {
      // 매핑 테이블에 없는 경우 일반 마스킹 처리 (예: "역삼동" -> "강남구" 등으로 매핑되지 않더라도 글자 치환)
      // 끝 글자 '동'을 '구'로 안전하게 대체하거나 마스킹 처리
      parts[1] = regionName.replace(/동$/, '구');
    } else if (regionName.endsWith('읍') || regionName.endsWith('면') || regionName.endsWith('리')) {
      parts[1] = '지역';
    }
  }

  return parts.join(' ');
};
