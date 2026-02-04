// 메인 애플리케이션

// 게임 상태
let gameState = {
    answer: '',
    wordLength: 0,
    guesses: [],
    currentGuess: [],  // 완성된 글자 배열
    currentInput: { cho: '', jung: '', jong: '' },  // 현재 조합 중인 글자
    gameStatus: 'playing',
    evaluations: [],
    keyboardState: {}
};

// 초기화
function initializeGame() {
    const todayWordData = getTodayWord();
    const answer = todayWordData.word;
    const wordLength = answer.length;

    const savedState = loadGameState();

    if (savedState && savedState.wordLength === wordLength) {
        gameState = {
            answer: answer,
            wordLength: wordLength,
            guesses: savedState.guesses || [],
            currentGuess: savedState.currentGuess ? savedState.currentGuess.split('') : [],
            currentInput: { cho: '', jung: '', jong: '' },
            gameStatus: savedState.gameStatus || 'playing',
            evaluations: savedState.evaluations || [],
            keyboardState: {}
        };
    } else {
        gameState = {
            answer: answer,
            wordLength: wordLength,
            guesses: [],
            currentGuess: [],
            currentInput: { cho: '', jung: '', jong: '' },
            gameStatus: 'playing',
            evaluations: [],
            keyboardState: {}
        };
        initializeGameState(wordLength);
    }

    const isFinished = gameState.gameStatus !== 'playing';

    // UI 초기화
    createGameBoard(wordLength, 5, isFinished);
    initializeModals();
    initAuth();
    initHiddenInput();

    // 문장 표시 및 박스 생성
    const sentenceDisplay = document.getElementById('sentence-display');
    if (sentenceDisplay) {
        let sentenceHtml = todayWordData.sentence || `${todayWordData.word}: ${todayWordData.description}`;

        const boxesHtml = `
            <span class="char-boxes">
                ${Array(wordLength).fill().map(() => '<div class="char-tile"></div>').join('')}
            </span>
        `;

        if (sentenceHtml.includes(todayWordData.word)) {
            sentenceHtml = sentenceHtml.replace(todayWordData.word, boxesHtml);
        } else {
            sentenceHtml = boxesHtml + " " + sentenceHtml;
        }

        sentenceDisplay.innerHTML = sentenceHtml;
    }

    showHint(wordLength, todayWordData);

    // 힌트 버튼 클릭 이벤트 (인라인)
    const hintBtn = document.getElementById('hint-btn');
    const inlineHint = document.getElementById('inline-hint-content');
    const closeBtn = document.getElementById('hint-close-btn');

    if (hintBtn && inlineHint) {
        hintBtn.onclick = () => {
            inlineHint.classList.remove('hidden');
        };
    }

    if (closeBtn && inlineHint) {
        closeBtn.onclick = () => {
            inlineHint.classList.add('hidden');
        };
    }

    // 저장된 상태가 있으면 동기화
    const hiddenInput = document.getElementById('hidden-input');
    if (hiddenInput && gameState.currentGuess.length > 0) {
        hiddenInput.value = gameState.currentGuess.join('');
        syncStateWithInput(hiddenInput.value);
    }

    updateBoardWithComposition();

    if (gameState.gameStatus !== 'playing') {
        handleGameEnd();
    }

    // 물리 키보드 포커스 유지
    document.addEventListener('keydown', (e) => {
        if (!document.querySelector('.modal:not(.hidden)')) {
            const input = document.getElementById('hidden-input');
            if (input) input.focus();
        }
    });
}

// 입력 내용과 게임 상태 동기화
function syncStateWithInput(value) {
    const chars = value.split('');
    if (chars.length === 0) {
        gameState.currentGuess = [];
        gameState.currentInput = { cho: '', jung: '', jong: '' };
        return;
    }

    // 마지막 글자만 조합 중으로 처리 (UI 표현을 위해)
    const lastChar = chars[chars.length - 1];
    gameState.currentGuess = chars.slice(0, -1);

    const dec = decomposeHangul(lastChar);
    if (dec) {
        gameState.currentInput = dec;
    } else {
        // 단일 자음/모음 또는 영문/기타
        gameState.currentInput = { cho: lastChar.toUpperCase(), jung: '', jong: '' };
    }
}

// 보드 업데이트 (조합 중인 글자 포함)
function updateBoardWithComposition(showResult = false) {
    const { currentGuess, currentInput } = gameState;
    const { cho, jung, jong } = currentInput;

    let displayGuess = [...currentGuess];

    if (cho) {
        // cho가 한글 낱자나 완성된 글자가 아닌 경우 (dec가 null이었던 경우)
        if (jung === '') {
            displayGuess.push(cho);
        } else {
            const composing = composeHangul(cho, jung || 'ㅏ', jong);
            if (composing && jung) {
                const actualComposing = composeHangul(cho, jung, jong);
                if (actualComposing) {
                    displayGuess.push(actualComposing);
                }
            } else {
                displayGuess.push(cho);
            }
        }
    }

    const activeIndex = gameState.gameStatus === 'playing' ? displayGuess.length - 1 : -1;
    // displayGuess.length가 실제 박스 인덱스임
    updateBoard(gameState.guesses, displayGuess, gameState.evaluations, gameState.wordLength, activeIndex, showResult);
}

// 추측 제출
let isProcessing = false;

async function submitGuess() {
    if (isProcessing) return;

    // 현재 조합 중인 글자 포함한 최종 단어 확인
    const input = document.getElementById('hidden-input');
    const guess = input ? input.value : '';

    if (guess.length !== gameState.wordLength) {
        showMessage('글자 수가 맞지 않습니다');
        animateRow(0, 'shake');
        return;
    }

    isProcessing = true;

    const evaluation = evaluateGuess(guess, gameState.answer);
    gameState.guesses.push(guess);
    gameState.evaluations.push(evaluation);

    updateBoardWithComposition(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    if (guess !== gameState.answer) {
        // 틀렸을 때 입력값 초기화
        gameState.currentGuess = [];
        gameState.currentInput = { cho: '', jung: '', jong: '' };
        if (input) input.value = '';

        if (gameState.guesses.length >= 5) {
            gameState.gameStatus = 'lost';
        } else {
            showMessage('틀렸습니다. 다시 시도해보세요!', 1000);
        }
    } else {
        gameState.gameStatus = 'won';
    }

    updateBoardWithComposition();
    isProcessing = false;

    if (gameState.gameStatus !== 'playing') {
        handleGameEnd();
    }

    saveCurrentState();
}

// 게임 종료 처리
function handleGameEnd() {
    const won = gameState.gameStatus === 'won';
    const guessCount = gameState.guesses.length;

    updateStatistics(won, guessCount);

    // 서버에 결과 아카이빙 (로그인 상태일 때)
    if (typeof archiveGameResult === 'function') {
        archiveGameResult(won, guessCount);
    }

    setTimeout(() => {
        if (won) {
            showMessage('정답입니다!', 3000);
            if (window.confetti) {
                window.confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            }
            setTimeout(() => showResultModal(), 1200);
        } else {
            showMessage(`정답은 "${gameState.answer}" 입니다`, 5000);
            setTimeout(() => {
                openModal('stats');
                updateStatsDisplay();
                showShareSection();
            }, 2000);
        }
    }, 500);
}

// 결과 모달
function showResultModal() {
    const todayWordData = getTodayWord();
    document.getElementById('result-note-title').textContent = todayWordData.original || todayWordData.word;
    document.getElementById('result-note-desc').textContent = todayWordData.description;
    document.getElementById('result-note-link').href = todayWordData.url;

    const shareBtn = document.getElementById('result-share-btn');
    shareBtn.onclick = () => {
        copyShareText();
    };

    openModal('result');
}

// 공유 텍스트 복사
function copyShareText() {
    const gameNumber = getGameNumber();
    const shareText = generateShareText(gameState.guesses, gameState.evaluations, gameState.wordLength, gameNumber);
    navigator.clipboard.writeText(shareText).then(() => {
        showMessage('결과가 복사되었습니다!');
    });
}

function showShareSection() {
    const section = document.getElementById('share-section');
    if (section) section.classList.remove('hidden');
    const btn = document.getElementById('share-btn');
    if (btn) btn.onclick = copyShareText;
}

// 상태 저장
function saveCurrentState() {
    const input = document.getElementById('hidden-input');
    const state = {
        date: new Date().toDateString(),
        wordLength: gameState.wordLength,
        guesses: gameState.guesses,
        currentGuess: input ? input.value : '',
        gameStatus: gameState.gameStatus,
        evaluations: gameState.evaluations
    };
    saveGameState(state);
}

// 숨겨진 입력창 처리
function initHiddenInput() {
    const input = document.getElementById('hidden-input');
    if (!input) return;

    // 화면 어디를 눌러도 입력창 포커스
    document.addEventListener('click', (e) => {
        if (gameState.gameStatus === 'playing' && !document.querySelector('.modal:not(.hidden)')) {
            // 버튼이나 인풋 자체를 클릭한 게 아니면 포커스
            if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A' && e.target.tagName !== 'INPUT') {
                input.focus();
            }
        }
    });

    input.addEventListener('input', (e) => {
        if (gameState.gameStatus !== 'playing') {
            input.value = '';
            return;
        }

        // 입력 글자수 제한
        if (input.value.length > gameState.wordLength) {
            input.value = input.value.slice(0, gameState.wordLength);
        }

        syncStateWithInput(input.value);
        updateBoardWithComposition();
        saveCurrentState();
    });

    input.addEventListener('keydown', (e) => {
        if (gameState.gameStatus !== 'playing') return;

        if (e.key === 'Enter') {
            e.preventDefault();
            submitGuess();
        }
    });

    // 초기 포커스
    setTimeout(() => input.focus(), 500);
}

document.addEventListener('DOMContentLoaded', initializeGame);
