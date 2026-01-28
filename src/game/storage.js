// 로컬 스토리지 키
const STORAGE_KEYS = {
    GAME_STATE: 'longblack-wordle-state',
    STATISTICS: 'longblack-wordle-stats'
};

// 게임 상태 저장
function saveGameState(state) {
    try {
        localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(state));
    } catch (e) {
        console.error('Failed to save game state:', e);
    }
}

// 게임 상태 불러오기
function loadGameState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
        if (!saved) return null;

        const state = JSON.parse(saved);

        // 날짜가 바뀌었는지 확인
        const today = new Date().toDateString();
        if (state.date !== today) {
            return null; // 새로운 날이면 null 반환
        }

        return state;
    } catch (e) {
        console.error('Failed to load game state:', e);
        return null;
    }
}

// 통계 저장
function saveStatistics(stats) {
    try {
        localStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify(stats));
    } catch (e) {
        console.error('Failed to save statistics:', e);
    }
}

// 통계 불러오기
function loadStatistics() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.STATISTICS);
        if (!saved) {
            return {
                played: 0,
                won: 0,
                currentStreak: 0,
                maxStreak: 0,
                guessDistribution: [0, 0, 0, 0, 0, 0]
            };
        }
        return JSON.parse(saved);
    } catch (e) {
        console.error('Failed to load statistics:', e);
        return {
            played: 0,
            won: 0,
            currentStreak: 0,
            maxStreak: 0,
            guessDistribution: [0, 0, 0, 0, 0, 0]
        };
    }
}

// 통계 업데이트
function updateStatistics(won, guessCount) {
    const stats = loadStatistics();

    stats.played++;

    if (won) {
        stats.won++;
        stats.currentStreak++;
        stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
        if (guessCount >= 1 && guessCount <= 6) {
            stats.guessDistribution[guessCount - 1]++;
        }
    } else {
        stats.currentStreak = 0;
    }

    saveStatistics(stats);
    return stats;
}

// 게임 상태 초기화 (새로운 날)
function initializeGameState(wordLength) {
    const state = {
        date: new Date().toDateString(),
        wordLength: wordLength,
        guesses: [],
        currentGuess: '',
        gameStatus: 'playing', // 'playing', 'won', 'lost'
        evaluations: []
    };
    saveGameState(state);
    return state;
}
