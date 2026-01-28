// 모달 컴포넌트

function initializeModals() {
    // 모달 열기
    document.getElementById('help-btn').addEventListener('click', () => {
        openModal('help');
    });

    document.getElementById('stats-btn').addEventListener('click', () => {
        openModal('stats');
        updateStatsDisplay();
    });

    // 모달 닫기
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalName = e.target.dataset.modal;
            closeModal(modalName);
        });
    });

    // 모달 배경 클릭 시 닫기
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });

    // 공유 버튼
    document.getElementById('share-btn').addEventListener('click', shareResults);
}

function openModal(modalName) {
    const modal = document.getElementById(`${modalName}-modal`);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeModal(modalName) {
    const modal = document.getElementById(`${modalName}-modal`);
    if (modal) {
        modal.classList.add('hidden');
    }
}

function updateStatsDisplay() {
    const stats = loadStatistics();

    document.getElementById('stat-played').textContent = stats.played;

    const winRate = stats.played > 0
        ? Math.round((stats.won / stats.played) * 100)
        : 0;
    document.getElementById('stat-win-rate').textContent = `${winRate}%`;

    document.getElementById('stat-streak').textContent = stats.currentStreak;
    document.getElementById('stat-max-streak').textContent = stats.maxStreak;
}

function showShareSection(guesses, evaluations, answer) {
    const shareSection = document.getElementById('share-section');
    shareSection.classList.remove('hidden');

    // 다음 단어까지 남은 시간 표시
    updateNextWordTimer();
    setInterval(updateNextWordTimer, 1000);
}

function updateNextWordTimer() {
    const time = getTimeUntilNextWord();
    const nextWordInfo = document.getElementById('next-word-info');
    nextWordInfo.textContent = `다음 단어까지 ${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
}

function shareResults() {
    const state = loadGameState();
    if (!state) return;

    const gameNumber = getGameNumber();
    const shareText = generateShareText(
        state.guesses,
        state.evaluations,
        state.wordLength,
        gameNumber
    );

    // 클립보드에 복사
    navigator.clipboard.writeText(shareText).then(() => {
        showMessage('결과가 복사되었습니다!');
    }).catch(() => {
        // 폴백: 텍스트 영역 사용
        const textarea = document.createElement('textarea');
        textarea.value = shareText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showMessage('결과가 복사되었습니다!');
    });
}

function showMessage(text, duration = 2000) {
    const message = document.getElementById('message');
    message.textContent = text;
    message.classList.remove('hidden');

    setTimeout(() => {
        message.classList.add('hidden');
    }, duration);
}
