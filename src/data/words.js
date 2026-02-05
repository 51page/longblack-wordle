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
        word: '취향',
        original: '공간 감상 수업 6 : 내 집도 영감이 된다, 나를 담는 공간 만들기',
        description: '“공간에 나를 담는 가장 확실한 방법이 있습니다. 바로 ‘나의 호기심을 기록하는 것’. 취향은 어느 날 하는 쇼핑 한두 번으로 생기지 않아요. 내가 무엇에 반응하고 설레는지를 기록한 시간이 쌓여야 만들어지죠. "',
        url: 'https://longblack.co/note/1882',
        sentence: '“남이 내 집의 경계를 넘어 들어올 때, 비로소 내  <span class="sentence-blank">취향</span>을 확인할 수 있습니다. 내 공간을 소개하면서 칭찬과 분석을 받다 보면, ‘아, 이런 게 눈에 들어오는구나’라고 확인하게 되는 거죠. 그렇게 나를 더 깊이 알아갈 수 있습니다.”'
    },
    {
        word: '취향',
        original: '공간 감상 수업 6 : 내 집도 영감이 된다, 나를 담는 공간 만들기',
        description: '“공간에 나를 담는 가장 확실한 방법이 있습니다. 바로 ‘나의 호기심을 기록하는 것’. 취향은 어느 날 하는 쇼핑 한두 번으로 생기지 않아요. 내가 무엇에 반응하고 설레는지를 기록한 시간이 쌓여야 만들어지죠. "',
        url: 'https://longblack.co/note/1882',
        sentence: '“남이 내 집의 경계를 넘어 들어올 때, 비로소 내  <span class="sentence-blank">취향</span>을 확인할 수 있습니다. 내 공간을 소개하면서 칭찬과 분석을 받다 보면, ‘아, 이런 게 눈에 들어오는구나’라고 확인하게 되는 거죠. 그렇게 나를 더 깊이 알아갈 수 있습니다.”'
    },
    {
        word: '취향',
        original: '공간 감상 수업 6 : 내 집도 영감이 된다, 나를 담는 공간 만들기',
        description: '“공간에 나를 담는 가장 확실한 방법이 있습니다. 바로 ‘나의 호기심을 기록하는 것’. 취향은 어느 날 하는 쇼핑 한두 번으로 생기지 않아요. 내가 무엇에 반응하고 설레는지를 기록한 시간이 쌓여야 만들어지죠. "',
        url: 'https://longblack.co/note/1882',
        sentence: '“남이 내 집의 경계를 넘어 들어올 때, 비로소 내  <span class="sentence-blank">취향</span>을 확인할 수 있습니다. 내 공간을 소개하면서 칭찬과 분석을 받다 보면, ‘아, 이런 게 눈에 들어오는구나’라고 확인하게 되는 거죠. 그렇게 나를 더 깊이 알아갈 수 있습니다.”'
    },
    {
        word: '취향',
        original: '공간 감상 수업 6 : 내 집도 영감이 된다, 나를 담는 공간 만들기',
        description: '“공간에 나를 담는 가장 확실한 방법이 있습니다. 바로 ‘나의 호기심을 기록하는 것’. 취향은 어느 날 하는 쇼핑 한두 번으로 생기지 않아요. 내가 무엇에 반응하고 설레는지를 기록한 시간이 쌓여야 만들어지죠. "',
        url: 'https://longblack.co/note/1882',
        sentence: '“남이 내 집의 경계를 넘어 들어올 때, 비로소 내  <span class="sentence-blank">취향</span>을 확인할 수 있습니다. 내 공간을 소개하면서 칭찬과 분석을 받다 보면, ‘아, 이런 게 눈에 들어오는구나’라고 확인하게 되는 거죠. 그렇게 나를 더 깊이 알아갈 수 있습니다.”'
    },
  
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






