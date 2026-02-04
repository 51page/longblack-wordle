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
    const isLoggedIn = typeof firebase !== 'undefined' && firebase.auth().currentUser;
    const loginMsg = document.getElementById('stats-login-msg');

    if (loginMsg) {
        if (!isLoggedIn) {
            loginMsg.classList.remove('hidden');
        } else {
            loginMsg.classList.add('hidden');
        }
    }

    document.getElementById('stat-played').textContent = stats.played;

    const winRate = stats.played > 0
        ? Math.round((stats.won / stats.played) * 100)
        : 0;
    document.getElementById('stat-win-rate').textContent = `${winRate}%`;

    document.getElementById('stat-streak').textContent = stats.currentStreak;
    document.getElementById('stat-max-streak').textContent = stats.maxStreak;

    // 배지 및 리더보드 업데이트
    updateBadgeDisplay(stats);
    updateLeaderboardDisplay();
}

// 배지 표시 업데이트
function updateBadgeDisplay(stats) {
    const badgeList = document.getElementById('badge-list');
    if (!badgeList) return;

    const badges = [
        { id: 'first-win', name: '첫 성공', icon: '🐣', condition: stats.won >= 1 },
        { id: 'streak-3', name: '3일 연속', icon: '🔥', condition: stats.maxStreak >= 3 },
        { id: 'streak-7', name: '7일 연속', icon: '💎', condition: stats.maxStreak >= 7 },
        { id: 'win-10', name: '10회 달성', icon: '🏆', condition: stats.won >= 10 }
    ];

    badgeList.innerHTML = badges.map(badge => `
        <div class="badge-item ${badge.condition ? 'earned' : ''}" title="${badge.name}">
            <div class="badge-icon">${badge.icon}</div>
            <div class="badge-name">${badge.name}</div>
        </div>
    `).join('');
}

// 리더보드 표시 업데이트
async function updateLeaderboardDisplay() {
    const leaderboardList = document.getElementById('leaderboard-list');
    if (!leaderboardList) return;

    // fetchLeaderboard는 auth.js에 정의되어 있음
    if (typeof fetchLeaderboard !== 'function') return;

    const rankings = await fetchLeaderboard();

    if (rankings.length === 0) {
        leaderboardList.innerHTML = '<div class="loading-spinner">로그인 후 랭킹을 확인해보세요!</div>';
        return;
    }

    leaderboardList.innerHTML = rankings.map((user, index) => `
        <div class="rank-item">
            <div class="rank-number">${index + 1}</div>
            <img class="rank-photo" src="${user.photoURL || 'https://www.gravatar.com/avatar/0000?d=mp'}" alt="">
            <div class="rank-name">${user.displayName || '익명의 러너'}</div>
            <div class="rank-value">${user.stats?.maxStreak || 0}<span>연속</span></div>
        </div>
    `).join('');
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
