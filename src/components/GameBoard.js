// 게임 보드 컴포넌트

// 게임 보드 컴포넌트

function createGameBoard(wordLength, maxGuesses = 5, isFinished = false) {
    const sentenceDisplay = document.getElementById('sentence-display');
    if (!sentenceDisplay) return;

    // 초기 상태에서는 빈 칸 박스들만 생성 (app.js에서 실제 문장 데이터를 기반으로 채움)
    updateLifeGauge(0, maxGuesses);
}

function updateLifeGauge(usedGuesses, maxGuesses = 5) {
    const fill = document.getElementById('life-gauge-fill');
    const count = document.getElementById('life-gauge-count');
    if (!fill) return;

    const remaining = maxGuesses - usedGuesses;
    const remainingPercent = (remaining / maxGuesses) * 100;
    fill.style.width = `${remainingPercent}%`;

    if (count) {
        count.textContent = `${remaining}/${maxGuesses}`;
    }

    // 불안감 자극 효과 (기회가 적을 때)
    if (remaining <= 1) {
        fill.classList.add('low');
    } else {
        fill.classList.remove('low');
    }
}

function updateBoard(guesses, currentGuess, evaluations, wordLength, activeIndex, showResult = false) {
    // GameBoard.js의 주 역할은 이제 문장 내의 '글자 박스'들을 업데이트하는 것입니다.
    const charTiles = document.querySelectorAll('.char-tile');
    if (charTiles.length === 0) return;

    // 마지막 시도 결과 표시 중인지 확인
    const lastEvaluation = evaluations.length > 0 ? evaluations[evaluations.length - 1] : null;
    const isShowingResult = showResult && lastEvaluation;

    charTiles.forEach((tile, i) => {
        const char = currentGuess[i] || '';
        tile.textContent = char;

        // 클래스 초기화
        tile.classList.remove('active', 'filled', 'correct', 'present', 'absent');

        if (char) {
            tile.classList.add('filled');
        }

        if (isShowingResult) {
            tile.classList.add(lastEvaluation[i]);
            tile.classList.add('flip');
        } else if (i === activeIndex) {
            tile.classList.add('active');
        }
    });

    // 생명 게이지 업데이트
    updateLifeGauge(guesses.length);
}

function animateRow(rowIndex, animation) {
    // 이제 한 줄(Row) 개념이 아니라 문장 내의 박스 뭉치(char-boxes) 개념입니다.
    const boxesContainer = document.querySelector('.char-boxes');
    if (!boxesContainer) return;

    if (animation === 'shake') {
        boxesContainer.classList.add('shake');
        setTimeout(() => boxesContainer.classList.remove('shake'), 500);
    }
}

function showHint(wordLength, wordData) {
    const extraHintText = document.getElementById('extra-hint-text-inline');
    if (extraHintText) {
        extraHintText.textContent = wordData.description;
    }

    const hintNoteLink = document.getElementById('hint-note-link-inline');
    if (hintNoteLink) hintNoteLink.href = wordData.url;
}
