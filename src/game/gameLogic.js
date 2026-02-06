// 게임 로직

// 한글 자모 테이블
const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const JUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

// 자음인지 확인
function isConsonant(char) {
    return CHO.includes(char) || JONG.includes(char);
}

// 모음인지 확인
function isVowel(char) {
    return JUNG.includes(char);
}

// 완성된 한글인지 확인
function isCompleteHangul(char) {
    const code = char.charCodeAt(0);
    return code >= 0xAC00 && code <= 0xD7A3;
}

// 한글 자모 분리 함수
function decomposeHangul(char) {
    if (!isCompleteHangul(char)) return null;

    const code = char.charCodeAt(0) - 0xAC00;
    const choIndex = Math.floor(code / 588);
    const jungIndex = Math.floor((code % 588) / 28);
    const jongIndex = code % 28;

    return {
        cho: CHO[choIndex],
        jung: JUNG[jungIndex],
        jong: JONG[jongIndex]
    };
}

// 한글 자모 조합 함수
function composeHangul(cho, jung, jong = '') {
    const choIndex = CHO.indexOf(cho);
    const jungIndex = JUNG.indexOf(jung);
    const jongIndex = JONG.indexOf(jong);

    if (choIndex === -1 || jungIndex === -1 || jongIndex === -1) {
        return null;
    }

    const code = 0xAC00 + (choIndex * 588) + (jungIndex * 28) + jongIndex;
    return String.fromCharCode(code);
}

// 복합 모음 조합
function combineVowels(v1, v2) {
    const combinations = {
        'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ',
        'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ',
        'ㅡㅣ': 'ㅢ'
    };
    return combinations[v1 + v2] || null;
}

// 복합 종성 조합
function combineJongseong(j1, j2) {
    const combinations = {
        'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ',
        'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ',
        'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ',
        'ㅂㅅ': 'ㅄ'
    };
    return combinations[j1 + j2] || null;
}

// 추측 평가 함수
function evaluateGuess(guess, answer) {
    const evaluation = [];
    const answerChars = answer.split('');
    const guessChars = guess.split('');
    const used = new Array(answer.length).fill(false);

    // 첫 번째 패스: 정확한 위치 찾기
    for (let i = 0; i < guessChars.length; i++) {
        if (guessChars[i] === answerChars[i]) {
            evaluation[i] = 'correct';
            used[i] = true;
        }
    }

    // 두 번째 패스: 존재하지만 위치가 틀린 글자 찾기
    for (let i = 0; i < guessChars.length; i++) {
        if (evaluation[i] === 'correct') continue;

        let found = false;
        for (let j = 0; j < answerChars.length; j++) {
            if (!used[j] && guessChars[i] === answerChars[j]) {
                evaluation[i] = 'present';
                used[j] = true;
                found = true;
                break;
            }
        }

        if (!found) {
            evaluation[i] = 'absent';
        }
    }

    return evaluation;
}

// 키보드 상태 업데이트
function updateKeyboardState(guess, evaluation, keyboardState) {
    const chars = guess.split('');

    chars.forEach((char, i) => {
        const currentState = keyboardState[char] || 'unused';
        const newState = evaluation[i];

        // 우선순위: correct > present > absent > unused
        const priority = { correct: 3, present: 2, absent: 1, unused: 0 };

        if (priority[newState] > priority[currentState]) {
            keyboardState[char] = newState;
        }
    });

    return keyboardState;
}

// 게임 종료 확인
function checkGameEnd(guesses, answer, maxGuesses = 5) {
    // 승리 확인
    if (guesses.length > 0 && guesses[guesses.length - 1] === answer) {
        return { status: 'won', guessCount: guesses.length };
    }

    // 패배 확인
    if (guesses.length >= maxGuesses) {
        return { status: 'lost', answer: answer };
    }

    return { status: 'playing' };
}

// 공유 텍스트 생성
function generateShareText(guesses, evaluations, wordLength, gameNumber) {
    const isWon = guesses[guesses.length - 1] === getTodayWord().word;
    const guessCount = guesses.length;
    const totalChances = 5;

    let text = `LB 문장 채우기 #${gameNumber}\n`;

    if (isWon) {
        text += `${totalChances}번의 기회 중 ${guessCount}번 만에 정답을 맞췄어요!\n\n`;
    } else {
        text += `아쉽게도 정답을 맞추지 못했어요.\n\n`;
    }

    evaluations.forEach(evaluation => {
        const line = evaluation.map(status => {
            if (status === 'correct') return '🟩';
            if (status === 'present') return '🟨';
            return '⬜';
        }).join('');
        text += line + '\n';
    });

    text += '\n당신도 문장 채우기에 도전해보세요!\n';
    text += window.location.origin + window.location.pathname;

    return text;
}

// 게임 번호 계산 (시작일로부터 며칠째인지)
function getGameNumber() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date('2026-01-28');
    startDate.setHours(0, 0, 0, 0);

    return Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
}
