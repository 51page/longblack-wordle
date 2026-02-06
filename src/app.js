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
    keyboardState: {},
    isFocused: false
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
    initLogo();

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
        handleGameEnd(false); // 이미 종료된 상태이므로 모달 띄우지 않음
    }

}

// 입력 내용과 게임 상태 동기화
function syncStateWithInput(value) {
    const chars = Array.from(value);
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
        // 단일 자음/모음 또는 영문/기타 (사용자 입력 케이스 유지)
        gameState.currentInput = { cho: lastChar, jung: '', jong: '' };
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

    const isComposing = currentInput.cho !== '';
    let activeIndex = -1;

    if (gameState.gameStatus === 'playing') {
        if (isComposing) {
            activeIndex = displayGuess.length - 1;
        } else {
            activeIndex = displayGuess.length;
            if (activeIndex >= gameState.wordLength) activeIndex = gameState.wordLength - 1;
        }
    }

    // 만약 게임이 끝난 상태라면(성공/실패), 정답을 칸에 채워줌
    if (gameState.gameStatus !== 'playing') {
        displayGuess = gameState.answer.split('');
        showResult = true; // 결과 색상(성공/실패) 반영
    }

    updateBoard(gameState.guesses, displayGuess, gameState.evaluations, gameState.wordLength, activeIndex, showResult, gameState.isFocused);
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

    if (guess.toUpperCase() !== gameState.answer.toUpperCase()) {
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
        handleGameEnd(true); // 방금 종료되었으므로 모달 띄움
        updateHintButton();
    }

    saveCurrentState();
}

// 게임 종료 처리
function handleGameEnd(showModal = true) {
    const won = gameState.gameStatus === 'won';
    const guessCount = gameState.guesses.length;

    // 통계 및 서버 저장 (이미 저장이 되어있을 수도 있지만 안전하게 호출)
    updateStatistics(won, guessCount);

    /* 닉네임 입력 완료 시 저장하므로 여기서는 호출하지 않음
    if (typeof archiveGameResult === 'function') {
        archiveGameResult(won, guessCount);
    }
    */

    if (!showModal) return;

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
    document.getElementById('result-note-link').href = todayWordData.url;

    // 닉네임 확인 버튼 이벤트
    const nicknameInput = document.getElementById('result-nickname-input');
    const confirmBtn = document.getElementById('confirm-nickname-btn');

    if (nicknameInput && confirmBtn) {
        // 기존 상태 초기화 (이미 입력했었는지 여부는 세션이나 로컬스토리지에 저장 가능하지만 
        // 여기선 단순하게 모달 열릴 때마다 초기화하거나 상태에 따라 처리)
        nicknameInput.disabled = false;
        confirmBtn.disabled = false;
        nicknameInput.value = localStorage.getItem('userNickname') || '';

        confirmBtn.onclick = () => {
            const nick = nicknameInput.value.trim();
            if (nick.length < 2) {
                showMessage('닉네임을 2자 이상 입력해주세요');
                return;
            }
            nicknameInput.disabled = true;
            confirmBtn.disabled = true;
            confirmBtn.textContent = '완료';
            localStorage.setItem('userNickname', nick);

            // 랭킹에 기록 반영을 위해 archiveGameResult 호출
            const won = gameState.gameStatus === 'won';
            const guessCount = gameState.guesses.length;
            if (typeof archiveGameResult === 'function') {
                archiveGameResult(won, guessCount, nick);
                showMessage('랭킹에 기록되었습니다!');
            }
        };
    }

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

// 커서 위치를 항상 끝으로 유지하는 헬퍼 함수
function moveCursorToEnd(el) {
    if (el.setSelectionRange) {
        const len = el.value.length;
        el.setSelectionRange(len, len);
    }
}

// 숨겨진 입력창 처리
function initHiddenInput() {
    const input = document.getElementById('hidden-input');
    if (!input) return;

    // 빈칸 클릭 시에만 입력창 활성화 (자동 포커스 방지)
    document.addEventListener('click', (e) => {
        if (gameState.gameStatus !== 'playing' || document.querySelector('.modal:not(.hidden)')) return;

        // 글자 박스(빈칸) 영역을 클릭했는지 확인
        const isBlankClick = e.target.closest('.char-tile') || e.target.closest('.char-boxes');

        if (isBlankClick) {
            input.focus({ preventScroll: true });
        } else {
            // 버튼, 링크, 혹은 다른 입력창(닉네임 등)을 클릭한 게 아니라면 포커스 해제
            if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A' && e.target.id !== 'result-nickname-input') {
                input.blur();
            }
        }
    });

    let isComposing = false;

    input.addEventListener('compositionstart', () => {
        isComposing = true;
    });

    input.addEventListener('compositionend', (e) => {
        isComposing = false;
        // 조합이 끝난 후 한 번 더 동기화
        syncStateWithInput(input.value);
        updateBoardWithComposition();
        saveCurrentState();
        // 커서 위치 교정
        moveCursorToEnd(input);
    });

    input.addEventListener('input', (e) => {
        if (gameState.gameStatus !== 'playing') {
            input.value = '';
            return;
        }

        // 조합 중에는 입력값을 직접 수정하지 않음 (글자 거꾸로 입력되거나 조합 깨짐 방지)
        if (!isComposing) {
            if (input.value.length > gameState.wordLength) {
                input.value = input.value.slice(0, gameState.wordLength);
            }
        }

        syncStateWithInput(input.value);
        updateBoardWithComposition();
        saveCurrentState();

        // 커서가 0으로 튀는 것을 방지
        moveCursorToEnd(input);
    });

    input.addEventListener('keydown', (e) => {
        if (gameState.gameStatus !== 'playing') return;

        if (e.key === 'Enter') {
            e.preventDefault();
            submitGuess();
        } else if (e.key === 'Backspace') {
            // 모바일에서 백스페이스 대응을 위해 지연 동기화
            setTimeout(() => {
                syncStateWithInput(input.value);
                updateBoardWithComposition();
                saveCurrentState();
                moveCursorToEnd(input);
            }, 10);
        }
    });


    // 포커스 상태 관리
    input.addEventListener('focus', () => {
        gameState.isFocused = true;
        document.body.classList.add('keyboard-active');
        updateBoardWithComposition();

        // 포커스 시 커서를 끝으로 보냄
        moveCursorToEnd(input);

        // 모바일 브라우저의 강제 스크롤 방지를 위해 상단 고정
        setTimeout(() => {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        }, 50);
    });

    input.addEventListener('blur', () => {
        gameState.isFocused = false;
        document.body.classList.remove('keyboard-active');
        updateBoardWithComposition();
    });

    updateHintButton();
}


// 로고 클릭시 새로고침 (홈 버튼 기능)
function initLogo() {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.onclick = () => window.location.reload();
    }
}

// 게임 종료 시 힌트 버튼을 노트 링크로 변경
function updateHintButton() {
    const isFinished = gameState.gameStatus !== 'playing';
    const hintBtn = document.getElementById('hint-btn');
    const inlineHint = document.getElementById('inline-hint-content');
    if (!hintBtn) return;

    if (isFinished) {
        const todayWordData = getTodayWord();
        hintBtn.textContent = '오늘의 롱블랙 노트 보러가기';
        hintBtn.className = 'note-link-btn'; // 스타일 변경
        hintBtn.onclick = (e) => {
            if (e) e.stopPropagation();
            // 힌트 창이 열려있다면 닫기
            if (inlineHint) inlineHint.classList.add('hidden');
            window.open(todayWordData.url, '_blank');
        };
    } else {
        hintBtn.textContent = '힌트 보기';
        hintBtn.className = 'hint-btn';
        hintBtn.onclick = () => {
            if (inlineHint) inlineHint.classList.remove('hidden');
        };
    }
}

document.addEventListener('DOMContentLoaded', initializeGame);
