// 게임 보드 컴포넌트

function createGameBoard(wordLength, maxGuesses = 6) {
    const board = document.getElementById('game-board');
    board.innerHTML = '';

    for (let i = 0; i < maxGuesses; i++) {
        const row = document.createElement('div');
        row.className = 'board-row';
        row.dataset.row = i;

        for (let j = 0; j < wordLength; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.dataset.col = j;
            row.appendChild(tile);
        }

        board.appendChild(row);
    }
}

function updateBoard(guesses, currentGuess, evaluations, wordLength) {
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
                tile.className = currentGuess[colIndex] ? 'tile filled' : 'tile';
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

function showHint(wordLength, description) {
    const hint = document.getElementById('hint');
    hint.innerHTML = `정답은 <strong>${wordLength}글자</strong>입니다.<br>${description}`;
}
