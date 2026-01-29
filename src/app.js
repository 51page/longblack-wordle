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
    // 오늘의 단어 가져오기
    const todayWordData = getTodayWord();
    const answer = todayWordData.word;
    const wordLength = answer.length;

    // 테스트 버전: 새로고침 시 항상 새 게임 시작 (저장된 상태 무시)
    // const savedState = loadGameState();
    const savedState = null;

    if (savedState && savedState.wordLength === wordLength) {
        // 저장된 상태 복원
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

        // 키보드 상태 재구성
        gameState.guesses.forEach((guess, i) => {
            updateKeyboardState(guess, gameState.evaluations[i], gameState.keyboardState);
        });
    } else {
        // 새 게임 시작
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

    // UI 초기화
    createGameBoard(wordLength);
    createKeyboard(handleKeyPress);
    initializeModals();

    // 힌트 표시 (글자 수 표시)
    showHint(wordLength, todayWordData.description);

    // 타이머 시작
    startCountdown();

    // 보드 업데이트
    updateBoardWithComposition();
    updateKeyboard(gameState.keyboardState);

    // 게임이 이미 종료된 경우
    if (gameState.gameStatus !== 'playing') {
        handleGameEnd();
    }

    // 키보드 이벤트 리스너
    document.addEventListener('keydown', handlePhysicalKeyPress);

    // 첫 방문자를 위한 도움말 표시
    if (!localStorage.getItem('longblack-wordle-visited')) {
        setTimeout(() => {
            openModal('help');
            localStorage.setItem('longblack-wordle-visited', 'true');
        }, 500);
    }
}

// 카운트다운 타이머 시작
function startCountdown() {
    const countdownElement = document.getElementById('countdown');

    function updateTimer() {
        const { hours, minutes, seconds } = getTimeUntilNextWord();
        countdownElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

// 한글 조합 처리
function handleKoreanInput(key) {
    const { cho, jung, jong } = gameState.currentInput;

    // 자음 입력
    if (isConsonant(key)) {
        if (!cho) {
            // 초성 입력
            gameState.currentInput.cho = key;
        } else if (!jung) {
            // 중성이 없으면 초성으로 처리 (오류 방지)
            return false;
        } else if (!jong) {
            // 종성 입력
            gameState.currentInput.jong = key;
        } else {
            // 이미 종성이 있으면 새 글자 시작
            const composed = composeHangul(cho, jung, jong);
            if (composed && gameState.currentGuess.length < gameState.wordLength) {
                gameState.currentGuess.push(composed);
                gameState.currentInput = { cho: key, jung: '', jong: '' };
            } else {
                return false;
            }
        }
    }
    // 모음 입력
    else if (isVowel(key)) {
        if (!cho) {
            // 초성 없이 모음 입력 불가
            return false;
        } else if (!jung) {
            // 중성 입력
            gameState.currentInput.jung = key;
        } else if (!jong) {
            // 복합 모음 시도
            const combined = combineVowels(jung, key);
            if (combined) {
                gameState.currentInput.jung = combined;
            } else {
                // 복합 불가능하면 현재 글자 완성하고 새 글자 시작
                const composed = composeHangul(cho, jung);
                if (composed && gameState.currentGuess.length < gameState.wordLength) {
                    gameState.currentGuess.push(composed);
                    gameState.currentInput = { cho: '', jung: '', jong: '' };
                    return false;
                } else {
                    return false;
                }
            }
        } else {
            // 종성이 있으면 종성을 초성으로 이동하고 새 중성 입력
            const composed = composeHangul(cho, jung);
            if (composed && gameState.currentGuess.length < gameState.wordLength) {
                gameState.currentGuess.push(composed);
                gameState.currentInput = { cho: jong, jung: key, jong: '' };
            } else {
                return false;
            }
        }
    }

    return true;
}

// 백스페이스 처리
function handleBackspace() {
    const { cho, jung, jong } = gameState.currentInput;

    if (jong) {
        // 종성 삭제
        gameState.currentInput.jong = '';
    } else if (jung) {
        // 중성 삭제
        gameState.currentInput.jung = '';
    } else if (cho) {
        // 초성 삭제
        gameState.currentInput.cho = '';
    } else if (gameState.currentGuess.length > 0) {
        // 이전 완성된 글자를 분해
        const lastChar = gameState.currentGuess.pop();
        const decomposed = decomposeHangul(lastChar);
        if (decomposed) {
            gameState.currentInput = {
                cho: decomposed.cho,
                jung: decomposed.jung,
                jong: decomposed.jong
            };
        }
    }
}

// 보드 업데이트 (조합 중인 글자 포함)
function updateBoardWithComposition() {
    const displayGuess = [...gameState.currentGuess];

    // 현재 조합 중인 글자 추가
    const { cho, jung, jong } = gameState.currentInput;
    if (cho) {
        const composing = composeHangul(cho, jung || 'ㅏ', jong);  // 임시로 'ㅏ' 사용
        if (composing && jung) {
            const actualComposing = composeHangul(cho, jung, jong);
            if (actualComposing) {
                displayGuess.push(actualComposing);
            }
        } else if (cho && !jung) {
            // 초성만 있을 때는 자음 그대로 표시
            displayGuess.push(cho);
        }
    }

    const displayString = displayGuess.join('');
    updateBoard(gameState.guesses, displayString, gameState.evaluations, gameState.wordLength);
}

// 키 입력 처리
function handleKeyPress(key) {
    if (gameState.gameStatus !== 'playing') return;

    if (key === 'Enter') {
        submitGuess();
    } else if (key === 'Backspace') {
        handleBackspace();
        updateBoardWithComposition();
        saveCurrentState();
    } else {
        const success = handleKoreanInput(key);
        if (success) {
            updateBoardWithComposition();
            saveCurrentState();
        }
    }
}

// 물리 키보드 입력 처리
function handlePhysicalKeyPress(e) {
    // 모달이 열려있으면 무시
    if (!document.querySelector('.modal.hidden')) return;

    if (e.key === 'Enter') {
        handleKeyPress('Enter');
    } else if (e.key === 'Backspace') {
        handleKeyPress('Backspace');
    } else if (/^[ㄱ-ㅎㅏ-ㅣ가-힣]$/.test(e.key)) {
        handleKeyPress(e.key);
    }
}

// 추측 제출
function submitGuess() {
    // 조합 중인 글자가 있으면 완성
    const { cho, jung, jong } = gameState.currentInput;
    if (cho && jung) {
        const composed = composeHangul(cho, jung, jong);
        if (composed && gameState.currentGuess.length < gameState.wordLength) {
            gameState.currentGuess.push(composed);
            gameState.currentInput = { cho: '', jung: '', jong: '' };
        }
    }

    const guess = gameState.currentGuess.join('');

    // 유효성 검사
    if (guess.length !== gameState.wordLength) {
        showMessage('글자 수가 맞지 않습니다');
        animateRow(gameState.guesses.length, 'shake');
        return;
    }

    // 완성된 한글인지 확인
    for (let char of guess) {
        if (!isCompleteHangul(char)) {
            showMessage('완성된 글자를 입력해주세요');
            animateRow(gameState.guesses.length, 'shake');
            return;
        }
    }

    // 추측 평가
    const evaluation = evaluateGuess(guess, gameState.answer);

    // 상태 업데이트
    gameState.guesses.push(guess);
    gameState.evaluations.push(evaluation);
    updateKeyboardState(guess, evaluation, gameState.keyboardState);
    gameState.currentGuess = [];
    gameState.currentInput = { cho: '', jung: '', jong: '' };

    // UI 업데이트
    updateBoardWithComposition();
    animateRow(gameState.guesses.length - 1, 'flip');

    setTimeout(() => {
        updateKeyboard(gameState.keyboardState);
    }, 300);

    // 게임 종료 확인
    const result = checkGameEnd(gameState.guesses, gameState.answer);
    if (result.status !== 'playing') {
        gameState.gameStatus = result.status;
        setTimeout(() => {
            handleGameEnd();
        }, 1500);
    }

    saveCurrentState();
}

// 게임 종료 처리
function handleGameEnd() {
    const won = gameState.gameStatus === 'won';
    const guessCount = gameState.guesses.length;

    // 통계 업데이트
    updateStatistics(won, guessCount);

    // 메시지 표시
    setTimeout(() => {
        if (won) {
            const messages = ['천재!', '훌륭해요!', '잘했어요!', '좋아요!', '아슬아슬!', '휴!'];
            const message = guessCount <= messages.length
                ? messages[guessCount - 1]
                : '성공!';
            showMessage(message, 3000);

            // 폭죽 효과 (폭죽 라이브러리 호출)
            if (window.confetti) {
                const duration = 3 * 1000;
                const animationEnd = Date.now() + duration;
                const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 3000 };

                function randomInRange(min, max) {
                    return Math.random() * (max - min) + min;
                }

                const interval = setInterval(function () {
                    const timeLeft = animationEnd - Date.now();

                    if (timeLeft <= 0) {
                        return clearInterval(interval);
                    }

                    const particleCount = 50 * (timeLeft / duration);
                    // since particles fall down, start a bit higher than random
                    window.confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                    window.confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
                }, 250);
            }

            // 결과 모달 표시 (성공 시)
            setTimeout(() => {
                showResultModal();
            }, 1200);
        } else {
            const todayWordData = getTodayWord();
            const displayAnswer = todayWordData.original || gameState.answer;
            showMessage(`정답은 "${displayAnswer}" 입니다`, 5000);

            // 실패 시에도 통계 모달은 표시
            setTimeout(() => {
                openModal('stats');
                updateStatsDisplay();
                showShareSection(gameState.guesses, gameState.evaluations, gameState.answer);
            }, 2500);
        }
    }, 500);
}

// 결과 모달 채우기 및 표시
function showResultModal() {
    const todayWordData = getTodayWord();

    // 모달 텍스트 및 링크 업데이트
    document.getElementById('result-title').textContent = '대단해요! 정답을 맞추셨습니다.';
    document.getElementById('result-message').textContent = '오늘의 문제 노트를 읽어보시고 의지력을 키워보세요!';

    document.getElementById('result-note-title').textContent = todayWordData.original || todayWordData.word;
    document.getElementById('result-note-desc').textContent = todayWordData.description;

    const linkBtn = document.getElementById('result-note-link');
    linkBtn.href = todayWordData.url;

    // 공유 버튼 이벤트 설정
    const shareBtn = document.getElementById('result-share-btn');
    shareBtn.onclick = () => {
        const startDate = new Date('2026-01-28');
        startDate.setHours(0, 0, 0, 0);
        const gameNumber = Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const shareText = generateShareText(gameState.guesses, gameState.evaluations, gameState.wordLength, gameNumber);

        navigator.clipboard.writeText(shareText).then(() => {
            showMessage('결과가 복사되었습니다!', 2000);
        });
    };

    // 다음 문제 타이머 표시
    const timerElement = document.getElementById('result-next-timer');
    function updateTimer() {
        const time = getTimeUntilNextWord();
        timerElement.textContent = `다음 문제까지 ${time.hours}시간 ${time.minutes}분 ${time.seconds}초 남았습니다.`;
    }

    updateTimer();
    const resultTimerInterval = setInterval(() => {
        if (!document.getElementById('result-modal').classList.contains('hidden')) {
            updateTimer();
        } else {
            clearInterval(resultTimerInterval);
        }
    }, 1000);

    openModal('result');
}

// 현재 상태 저장
function saveCurrentState() {
    const state = {
        date: new Date().toDateString(),
        wordLength: gameState.wordLength,
        guesses: gameState.guesses,
        currentGuess: gameState.currentGuess.join(''),
        gameStatus: gameState.gameStatus,
        evaluations: gameState.evaluations
    };
    saveGameState(state);
}

// 페이지 로드 시 게임 초기화
document.addEventListener('DOMContentLoaded', initializeGame);
