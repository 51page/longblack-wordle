// 게임 보드 컴포넌트

function createGameBoard(wordLength, maxGuesses = 5, isFinished = false) {
    const board = document.getElementById('game-board');
    board.innerHTML = '';

    // 도전자 섹션 컨테이너
    const livesSection = document.createElement('div');
    livesSection.className = 'lives-section';

    // 도전 기회 안내 텍스트
    const livesInfo = document.createElement('div');
    livesInfo.className = 'lives-info';

    if (isFinished) {
        livesInfo.innerHTML = `오늘 문장 퍼즐에 이미 참여하셨어요. 내일을 기다려주세요.<br>자정에 새로운 문제가 업데이트 됩니다.`;
        livesInfo.style.lineHeight = '1.6';
    } else {
        livesInfo.textContent = '총 5번의 도전 기회가 있어요!';
    }
    livesSection.appendChild(livesInfo);

    // 생명력 표시 (커피잔 아이콘)
    const livesContainer = document.createElement('div');
    livesContainer.className = 'lives-container';
    livesContainer.id = 'lives-container';

    for (let i = 0; i < maxGuesses; i++) {
        const cupContainer = document.createElement('div');
        cupContainer.className = 'coffee-cup-container';

        cupContainer.innerHTML = `
            <div class="cup-main">
                <div class="cup-liquid"></div>
                <div class="cup-bean-icon"></div>
            </div>
            <div class="cup-handle"></div>
        `;

        livesContainer.appendChild(cupContainer);
    }
    livesSection.appendChild(livesContainer);
    board.appendChild(livesSection);

    // 정답 입력칸 (딱 한 줄만)
    const rowWrapper = document.createElement('div');
    rowWrapper.className = 'row-container single-row';

    const row = document.createElement('div');
    row.className = 'board-row active-row';
    row.dataset.row = 0;

    for (let j = 0; j < wordLength; j++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.dataset.col = j;
        row.appendChild(tile);
    }

    rowWrapper.appendChild(row);
    board.appendChild(rowWrapper);
}

function updateBoard(guesses, currentGuess, evaluations, wordLength, activeIndex, showResult = false) {
    // 모든 추측 히스토리는 생명력 깎기로 대체됨
    // activeIndex: 현재 입력 중인 타일 위치

    // 생명력 업데이트
    const cups = document.querySelectorAll('.coffee-cup-container');
    const lostCount = guesses.length;

    cups.forEach((cup, index) => {
        if (index < lostCount) {
            cup.classList.add('lost');
        } else {
            cup.classList.remove('lost');
        }
    });

    // 입력칸 업데이트 (단일 행만 존재)
    const row = document.querySelector('.board-row.active-row');
    if (!row) return;

    const tiles = row.querySelectorAll('.tile');

    // 이전에 시도했던 추측들의 결과는 보여줄 필요가 없거나, 마지막 추측 결과만 슬쩍 보여줄 수 있음
    // 여기서는 현재 입력 중인 내용을 보여주는 데 집중

    // 마지막 제출 결과가 있으면 (애니메이션 중) 해당 색상을 보여줌
    // 제출 후 결과(색상)를 보여주는 상태인지 확인
    const lastEvaluation = evaluations.length > 0 ? evaluations[evaluations.length - 1] : null;
    const isShowingResult = showResult && lastEvaluation;

    for (let i = 0; i < wordLength; i++) {
        const tile = tiles[i];
        const char = currentGuess[i] || '';
        tile.textContent = char;

        tile.classList.remove('active', 'filled', 'correct', 'present', 'absent');

        if (char) {
            tile.classList.add('filled');
        }

        // 정답 체크 결과 표시 중이라면
        if (isShowingResult) {
            tile.classList.add(lastEvaluation[i]);
        } else if (i === activeIndex) {
            tile.classList.add('active');
        }
    }
}

function animateRow(rowIndex, animation) {
    const row = document.querySelector(`[data-row="${rowIndex}"]`);
    if (!row) return;

    const tiles = row.querySelectorAll('.tile');

    if (animation === 'shake') {
        tiles.forEach(tile => {
            tile.classList.add('shake');
            setTimeout(() => tile.classList.remove('shake'), 500);
        });
    } else if (animation === 'flip') {
        tiles.forEach((tile, index) => {
            setTimeout(() => {
                tile.classList.add('flip');
                setTimeout(() => tile.classList.remove('flip'), 600);
            }, index * 100);
        });
    }
}

function showHint(wordLength, wordData) {
    const wordCountHint = document.getElementById('word-count-hint');
    const extraHintText = document.getElementById('extra-hint-text');

    // 사용자의 요청에 따라 글자 수 힌트(예: 3글자 단어)는 표시하지 않음
    if (wordCountHint) {
        wordCountHint.style.display = 'none';
    }

    if (extraHintText) {
        extraHintText.textContent = wordData.description;
    }

    // 힌트 모달 내 롱블랙 노트 정보 채우기
    const hintNoteTitle = document.getElementById('hint-note-title');
    const hintNoteLink = document.getElementById('hint-note-link');

    if (hintNoteTitle) {
        hintNoteTitle.textContent = wordData.original || wordData.word;
    }
    if (hintNoteLink) {
        hintNoteLink.href = wordData.url;
    }

    // 기본 힌트 영역 텍스트 변경
    const hint = document.getElementById('hint');
    if (hint) {
        hint.innerHTML = '힌트가 필요하다면 아래 버튼을 클릭하세요.';
    }
}
