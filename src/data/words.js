// 롱블랙 노트 제목 기반 단어 데이터 (총 54개)
const WORDS_DATA = [
    { word: '칠스핸디', original: '칠스 핸디', description: '롱블랙 노트 제목' },
    { word: '곽민수', original: '곽민수', description: '롱블랙 노트 제목' },
    { word: '이하성', original: '이하성', description: '롱블랙 노트 제목' },
    { word: '후덕죽', original: '후덕죽', description: '롱블랙 노트 제목' },
    { word: '선제스님', original: '선제스님', description: '롱블랙 노트 제목' },
    { word: '로드', original: '로드', description: '롱블랙 노트 제목' },
    { word: '박웅현', original: '박웅현 2', description: '롱블랙 노트 제목' },
    { word: '인재전쟁', original: '인재전쟁', description: '롱블랙 노트 제목' },
    { word: '그립', original: '그립', description: '롱블랙 노트 제목' },
    { word: '더컨쿼러', original: '더 컨쿼러', description: '롱블랙 노트 제목' },
    { word: '장석주', original: '장석주', description: '롱블랙 노트 제목' },
    { word: '샐러디', original: '샐러디', description: '롱블랙 노트 제목' },
    { word: '뉴해피', original: '뉴해피', description: '롱블랙 노트 제목' },
    { word: '김새섬', original: '김새섬', description: '롱블랙 노트 제목' },
    { word: '걷는다', original: '걷는다', description: '롱블랙 노트 제목' },
    { word: '김태영', original: '김태영', description: '롱블랙 노트 제목' },
    { word: '박승홍', original: '박승홍', description: '롱블랙 노트 제목' },
    { word: '마나', original: '마나', description: '롱블랙 노트 제목' },
    { word: '디어즈', original: '디어즈', description: '롱블랙 노트 제목' },
    { word: '김창열', original: '김창열', description: '롱블랙 노트 제목' },
    { word: '제이오에이', original: 'JOH', description: '롱블랙 노트 제목' },
    { word: '이지풍', original: '이지풍', description: '롱블랙 노트 제목' },
    { word: '산산기어', original: '산산기어', description: '롱블랙 노트 제목' },
    { word: '캠프', original: 'CAMP', description: '롱블랙 노트 제목' },
    { word: '노스텔지어', original: '노스텔지어', description: '롱블랙 노트 제목' },
    { word: '쿠마켄고', original: '쿠마 켄고', description: '롱블랙 노트 제목' },
    { word: '고유지능', original: '고유지능', description: '롱블랙 노트 제목' },
    { word: '함지은', original: '함지은', description: '롱블랙 노트 제목' },
    { word: '위진복', original: '위진복', description: '롱블랙 노트 제목' },
    { word: '릭오웬스', original: '릭 오웬스', description: '롱블랙 노트 제목' },
    { word: '리들스푼', original: '리들스푼', description: '롱블랙 노트 제목' },
    { word: '몽벨', original: '몽벨', description: '롱블랙 노트 제목' },
    { word: '이경미', original: '이경미', description: '롱블랙 노트 제목' },
    { word: '테이블포포', original: '테이블포포', description: '롱블랙 노트 제목' },
    { word: '왜의쓸모', original: '왜의 쓸모', description: '롱블랙 노트 제목' },
    { word: '김종성', original: '김종성', description: '롱블랙 노트 제목' },
    { word: '히토니스트', original: '히토니스트', description: '롱블랙 노트 제목' },
    { word: '이창길', original: '이창길', description: '롱블랙 노트 제목' },
    { word: '임준영', original: '임준영', description: '롱블랙 노트 제목' },
    { word: '팩트풀니스', original: '팩트풀니스', description: '롱블랙 노트 제목' },
    { word: '아처', original: '아처', description: '롱블랙 노트 제목' },
    { word: '렛뎀이론', original: '렛뎀 이론', description: '롱블랙 노트 제목' },
    { word: '관계수업', original: '관계 수업', description: '롱블랙 노트 제목' },
    { word: '신티엔디', original: '신티엔디', description: '롱블랙 노트 제목' },
    { word: '정태희', original: '정태희', description: '롱블랙 노트 제목' },
    { word: '디스트릭트', original: '디스트릭트', description: '롱블랙 노트 제목' },
    { word: '이그노벨상', original: '이그노벨상', description: '롱블랙 노트 제목' },
    { word: '육경희', original: '육경희', description: '롱블랙 노트 제목' },
    { word: '이세돌', original: '이세돌', description: '롱블랙 노트 제목' },
    { word: '알바알토', original: '알바 알토', description: '롱블랙 노트 제목' },
    { word: '침묵깨기', original: '침묵 깨기', description: '롱블랙 노트 제목' },
    { word: '프린츠', original: '프린츠', description: '롱블랙 노트 제목' },
    { word: '밀크바', original: '밀크바', description: '롱블랙 노트 제목' },
    { word: '남궁인', original: '남궁인', description: '롱블랙 노트 제목' }
];

// 전체 단어를 유효 단어로 사용
const VALID_WORDS = WORDS_DATA;

// 날짜 기반 시드로 오늘의 단어 선택
function getTodayWord() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 시작일 설정
    const startDate = new Date('2026-01-28');
    startDate.setHours(0, 0, 0, 0);

    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

    // 54개 단어 중 날짜에 맞춰 순환 선택
    const index = daysSinceStart % VALID_WORDS.length;

    return VALID_WORDS[index];
}

// 다음 단어까지 남은 시간 계산
function getTimeUntilNextWord() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
}

// 유효한 한글 단어인지 확인
function isValidWord(word) {
    const koreanRegex = /^[가-힣]+$/;
    return koreanRegex.test(word);
}
