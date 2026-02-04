// 롱블랙 노트 제목, 힌트, URL 데이터
const WORDS_DATA = [
    {
        word: '주도성',
        original: '뇌 과학 : 주도성을 느끼는 뇌가 세상을 바꾼다',
        description: '“공부하기로 선택한 다음, 선생님이 불러주는 걸 그냥 듣기만 한다면 어떨까요. 이때 뇌는 내가 선택했다고 해도 주도권을 크게 느끼지 않습니다. 하지만 ‘지금 들려주는 내용의 다음 이야기는 뭐가 될까?’라는 질문을 품고 여러 시나리오를 예측하며 듣으면, 뇌는 다르게 느낍니다. 내 예측이 ‘맞았음’을 확인하는 순간, 그 결과물을 보며 뇌는 주도성을 느끼죠. 나아가 지금 이 대화의 다음을 예측하며 읽는 것도 마찬가지입니다.”',
        url: 'https://longblack.co/note/1879',
        sentence: 'AI는 양날의 검이에요. AI가 주는 답을 그대로 받아들이면 당연히 나의 <span class="sentence-blank">주도성</span>이 떨어질 겁니다. 내가 원하는 답에 가까워지도록 괴롭혀야죠.'
    },
    {
        word: 'ADHD',
        original: '가짜 ADHD : 우리는 왜 자신의 집중력에 만족하지 못할까?',
        description: '모든 문제를 ADHD 탓으로 돌려선 안 됩니다. 사실 복잡한 사회에서 아무런 어려움 없이 온전히 집중하며 사는 건 어렵습니다.',
        url: 'https://longblack.co/note/1859',
        sentence: '“모든 문제를 <span class="sentence-blank">ADHD</span> 탓으로 돌려선 안 됩니다. 사실 복잡한 사회에서 아무런 어려움 없이 온전히 집중하며 사는 건 어렵습니다.”'
    },
    {
        word: '의지력',
        original: '가짜 ADHD : 우리는 왜 자신의 집중력에 만족하지 못할까?',
        description: '배터리처럼 쓰면 닳는 유한한 자원이니, 이것에 기대지 말고 구조를 바꾸세요.',
        url: 'https://longblack.co/note/1859',
        sentence: '“<span class="sentence-blank">의지력</span>은 배터리처럼 쓰면 닳는 유한한 자원이니, 이것에 기대지 말고 구조를 바꾸세요.”'
    },
    {
        word: '찰스핸디',
        original: '찰스 핸디',
        description: '다정한 경영철학자, 포트폴리오 인생',
        url: 'https://longblack.co/note/1118',
        sentence: '“다정한 경영철학자 <span class="sentence-blank">찰스핸디</span>의 포트폴리오 인생을 만나보세요.”'
    },
    {
        word: '곽민수',
        original: '곽민수',
        description: '이집트 고고학자, 대세감 만드는 법',
        url: 'https://longblack.co/note/1116',
        sentence: '“이집트 고고학자 <span class="sentence-blank">곽민수</span>가 말하는 대세감 만드는 법에 대해 알아보세요.”'
    },
    { word: '이하성', original: '이하성', description: '타협하지 않는 셰프, 요리 괴물의 성장', url: 'https://longblack.co/note/1113' },
    { word: '후덕죽', original: '후덕죽', description: '현역 셰프, 멈추지 않는 즐거움', url: 'https://longblack.co/note/1111' },
    { word: '선제스님', original: '선제스님', description: '마음의 행복은 한 끼에서 시작된다', url: 'https://longblack.co/note/1110' },
    { word: '로드', original: '로드', description: '팀빌딩으로 1조원 뷰티 유니콘 만들다', url: 'https://longblack.co/note/1101' },
    { word: '박웅현', original: '박웅현 2', description: '뭉근하게 쌓는 삶, 반드시 넘쳐흐를 때', url: 'https://longblack.co/note/1098' },
    { word: '인재전쟁', original: '인재전쟁', description: '공해에 미친 중국을 추적한 PD 이야기', url: 'https://longblack.co/note/1097' },
    { word: '그립', original: '그립', description: '올해의 목표를 현실로 만드는 시간 설계', url: 'https://longblack.co/note/1094' },
    { word: '더컨쿼러', original: '더 컨쿼러', description: '반지의 제왕 세계를 달리는 피트니스 앱', url: 'https://longblack.co/note/1093' },
    { word: '장석주', original: '장석주', description: '대추 한 알 시인의 마음 공부와 삶', url: 'https://longblack.co/note/1090' },
    { word: '샐러디', original: '샐러디', description: '7년간 9배 성장, 욕망을 파는 샐러드', url: 'https://longblack.co/note/1089' },
    { word: '뉴해피', original: '뉴해피', description: '95만 팔로워, 행복의 새로운 관점', url: 'https://longblack.co/note/1086' },
    { word: '김새섬', original: '김새섬', description: '죽음 앞에서 다행이다 말할 수 있는 삶', url: 'https://longblack.co/note/1085' },
    { word: '걷는다', original: '걷는다', description: '100보도 안 걷는 시대, 두 발 깨우기', url: 'https://longblack.co/note/1082' },
    { word: '김태영', original: '김태영', description: '타짜와 추격자 명장면 만든 로케이션 매니저', url: 'https://longblack.co/note/1079' },
    { word: '박승홍', original: '박승홍', description: '국립중앙박물관 건축가가 꺼낸 이야기', url: 'https://longblack.co/note/1077' },
    { word: '마니', original: '마니', description: '일상 속 어쩔 수 없지 를 파고드는 브랜드', url: 'https://longblack.co/note/1076' },
    { word: '디어즈', original: '디어즈', description: '동료들이 왜 떠날까? 174호점 미용실 혁신', url: 'https://longblack.co/note/1075' },
    { word: '김창열', original: '김창열', description: '물방울 작가, 딜리부터 RM까지 마음 넓다', url: 'https://longblack.co/note/1073' },
    { word: '제이오에이', original: 'JOH', description: '매거진 B 발행인이 풀고 싶은 브랜드 오해', url: 'https://longblack.co/note/1069' },
    { word: '이지풍', original: '이지풍', description: '한화이글스 코치의 반등 전략, 속살 맡기', url: 'https://longblack.co/note/1068' },
    { word: '산산기어', original: '산산기어', description: '트렌드는 쫓는 게 아니라 함께 숨 쉬는 것', url: 'https://longblack.co/note/1066' },
    { word: '캠프', original: 'CAMP', description: '장난감만 팔아선 못 버틴다, 오늘의 기억', url: 'https://longblack.co/note/1064' },
    { word: '노스텔지어', original: '노스텔지어', description: '희소성의 공식으로 만든 LVMH 찾는 한옥', url: 'https://longblack.co/note/1061' },
    { word: '쿠마켄고', original: '쿠마 켄고', description: '약한 건축으로 세계를 설득한 건축가', url: 'https://longblack.co/note/1060' },
    { word: '고유지능', original: '고유지능', description: '당신이 여전히 AI보다 똑똑한 이유', url: 'https://longblack.co/note/1055' },
    { word: '함지은', original: '함지은', description: '한국에서 가장 아름다운 책 만든 디자이너', url: 'https://longblack.co/note/1054' },
    { word: '위진복', original: '위진복', description: '쪽방촌 컨테이너로 건축상을 휩쓴 건축가', url: 'https://longblack.co/note/1053' },
    { word: '릭오웬스', original: '릭 오웬스', description: '어둠의 군주, 반항심을 브랜드화한 디자이너', url: 'https://longblack.co/note/1051' },
    { word: '리들스푼', original: '리들스푼', description: '죄책감 없는 한 끼로 고인물 시장을 바꾸다', url: 'https://longblack.co/note/1049' },
    { word: '몽벨', original: '몽벨', description: '유행을 거부한 50년, 일본의 파타고니아', url: 'https://longblack.co/note/1048' },
    { word: '이경미', original: '이경미', description: 'UX 디자이너가 혼잡한 응급실을 바꾸다', url: 'https://longblack.co/note/1047' },
    { word: '테이블포포', original: '테이블포포', description: '태안을 품은 한남동, 관계가 담긴 요리', url: 'https://longblack.co/note/1044' },
    { word: '왜의쓸모', original: '왜의 쓸모', description: '관계를 맺는 힘은 이유 구사력에서 나온다', url: 'https://longblack.co/note/1043' },
    { word: '김종성', original: '김종성', description: '아흔 살 건축가, 서울에 햇빛을 선물하다', url: 'https://longblack.co/note/1039' },
    { word: '히토니스트', original: '히토니스트', description: '맵부심이 키운 핫소스, 넷플릭스도 찾다', url: 'https://longblack.co/note/1038' },
    { word: '이창길', original: '이창길', description: '서울과 다른 길, 마계인천 기획자의 사고법', url: 'https://longblack.co/note/1037' },
    { word: '임준영', original: '임준영', description: '삼성전자 타이틀 뗀 후 워터밤 브랜딩까지', url: 'https://longblack.co/note/1035' },
    { word: '팩트풀니스', original: '팩트풀니스', description: '빌 게이츠가 꼽은 세상을 똑똑하게 보는 법', url: 'https://longblack.co/note/1033' },
    { word: '아처', original: '아처', description: '파울로 코엘료가 전하는 마음 수련법', url: 'https://longblack.co/note/1031' },
    { word: '렛뎀이론', original: '렛뎀 이론', description: '내버려두자, 내가 하자 삶의 질서 잡기', url: 'https://longblack.co/note/1029' },
    { word: '관계수업', original: '관계 수업', description: '잘 지냈어? 그 한마디가 어려운 당신에게', url: 'https://longblack.co/note/1028' },
    { word: '신티엔디', original: '신티엔디', description: '상하이 랜드마크, 25년 공간 콘텐츠 전략', url: 'https://longblack.co/note/1026' },
    { word: '정태희', original: '정태희', description: '일 잘하는데 리더십 최악, 환골탈태의 기록', url: 'https://longblack.co/note/1025' },
    { word: '디스트릭트', original: '디스트릭트', description: '5년간 1000만 방문, 콘텐츠계 BTS 꿈꾸다', url: 'https://longblack.co/note/1023' },
    { word: '이그노벨상', original: '이그노벨상', description: '종이비행기 날리는 괴짜들이 세상 바꾸기', url: 'https://longblack.co/note/1021' },
    { word: '육경희', original: '육경희', description: '마흔에 아이스크림, 육십에 순대 장인 되다', url: 'https://longblack.co/note/1019' },
    { word: '이세돌', original: '이세돌', description: 'AI를 이긴 인간, 자신만의 수를 두는 법', url: 'https://longblack.co/note/1017' },
    { word: '알바알토', original: '알바 알토', description: '아르텍 스툴과 요양원, 100년 가는 아름다움', url: 'https://longblack.co/note/1011' },
    { word: '침묵깨기', original: '침묵 깨기', description: '원하는 걸 말하지 못해 집에서 후회한다면', url: 'https://longblack.co/note/1009' },
    { word: '프린츠', original: '프린츠', description: '로고는 중요하지 않다, 11년 생존 카페', url: 'https://longblack.co/note/1008' },
    { word: '밀크바', original: '밀크바', description: '레시피는 버려라, 17년 디저트 왕국 비밀', url: 'https://longblack.co/note/1007' },
    { word: '남궁인', original: '남궁인', description: '응급실을 지키는 의사, 생의 간절한 의지', url: 'https://longblack.co/note/1005' }
];

// 3~5글자 단어만 필터링하여 사용
const VALID_WORDS = WORDS_DATA.filter(item => item.word.length >= 3 && item.word.length <= 5);

// 날짜 기반 시드로 오늘의 단어 선택
function getTodayWord() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 시작일 설정 (오늘 단어를 주도성으로 맞추기 위해 2026-02-04로 변경)
    const startDate = new Date('2026-02-04');
    startDate.setHours(0, 0, 0, 0);

    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

    // 54개 단어 중 날짜에 맞춰 순환 선택
    const index = Math.abs(daysSinceStart) % VALID_WORDS.length;

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
