// 게임 보드 컴포넌트

function createGameBoard(wordLength, maxGuesses = 5) {
    const board = document.getElementById('game-board');
    board.innerHTML = '';

    // 게임 안내 메시지 추가
    const instruction = document.createElement('div');
    instruction.className = 'game-instruction';
    instruction.textContent = '5번의 기회가 있어요! 지금 도전하세요';
    board.appendChild(instruction);

    for (let i = 0; i < maxGuesses; i++) {
        const rowWrapper = document.createElement('div');
        rowWrapper.className = 'row-container';

        // 행 번호 추가
        const rowNumber = document.createElement('div');
        rowNumber.className = 'row-number';
        rowNumber.textContent = i + 1;
        rowWrapper.appendChild(rowNumber);

        const row = document.createElement('div');
        row.className = 'board-row';
        row.dataset.row = i;

        for (let j = 0; j < wordLength; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.dataset.col = j;
            row.appendChild(tile);
        }

        rowWrapper.appendChild(row);
        board.appendChild(rowWrapper);
    }
}

function updateBoard(guesses, currentGuess, evaluations, wordLength, activeIndex) {
    const rows = document.querySelectorAll('.board-row');

    rows.forEach((row, rowIndex) => {
        const tiles = row.querySelectorAll('.tile');

        if (rowIndex < guesses.length) {
            // 이미 제출된 추측
            const guess = guesses[rowIndex];
            const evaluation = evaluations[rowIndex];

            tiles.forEach((tile, colIndex) => {
                tile.textContent = guess[colIndex] || '';
                tile.className = `tile ${evaluation[colIndex]}`;
            });
        } else if (rowIndex === guesses.length) {
            // 현재 입력 중인 행
            tiles.forEach((tile, colIndex) => {
                tile.textContent = currentGuess[colIndex] || '';

                let className = 'tile';
                if (currentGuess[colIndex]) {
                    className += ' filled';
                }

                // 현재 입력 포커스가 있는 타일에 'active' 클래스 추가
                if (colIndex === activeIndex) {
                    className += ' active';
                }

                tile.className = className;
            });
        } else {
            // 빈 행
            tiles.forEach(tile => {
                tile.textContent = '';
                tile.className = 'tile';
            });
        }
    });
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
