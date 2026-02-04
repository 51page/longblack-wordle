// Firebase 인증 처리 전용 로직

// 사용자님의 실제 설정값 적용
const firebaseConfig = {
    apiKey: "AIzaSyA6fvJ7bZHnIOfQZrFUPit0ZYGK25VfWBg",
    authDomain: "ben-tf.firebaseapp.com",
    projectId: "ben-tf",
    storageBucket: "ben-tf.firebasestorage.app",
    messagingSenderId: "531601109029",
    appId: "1:531601109029:web:0b4386c517c6251c038fcc"
};

// Firebase 초기화 (CDN compat 모드)
let app, auth, db;
try {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
} catch (e) {
    console.error("Firebase 초기화 실패. config를 확인하세요.");
}

// 로그인 상태 감지 및 UI 업데이트
function initAuth() {
    if (!auth) return;

    auth.onAuthStateChanged(async (user) => {
        const loginBtn = document.getElementById('login-btn');
        const userProfile = document.getElementById('user-profile');
        const userPhoto = document.getElementById('user-photo');

        if (user) {
            // 로그인 완료 상태
            if (loginBtn) loginBtn.classList.add('hidden');
            if (userProfile) userProfile.classList.remove('hidden');
            if (userPhoto) userPhoto.src = user.photoURL;

            // 데이터 동기화
            await syncUserData(user.uid);
        } else {
            // 로그아웃 상태
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (userProfile) userProfile.classList.add('hidden');
        }
    });

    // 닉네임 저장 버튼 이벤트
    const saveNicknameBtn = document.getElementById('save-nickname-btn');
    if (saveNicknameBtn) {
        saveNicknameBtn.addEventListener('click', saveNickname);
    }

    // 로그인 버튼 클릭 이벤트
    const loginBtnElement = document.getElementById('login-btn');
    if (loginBtnElement) {
        loginBtnElement.addEventListener('click', loginWithGoogle);
    }

    // 프로필 클릭 시 로그아웃
    const userProfileElement = document.getElementById('user-profile');
    if (userProfileElement) {
        userProfileElement.addEventListener('click', () => {
            if (confirm('로그아웃 하시겠습니까?')) {
                auth.signOut().then(() => {
                    // 로그아웃 시 로컬 게임 상태도 리셋하는 것이 안전함 (선택사항)
                    // localStorage.removeItem('longblack-wordle-state');
                    window.location.reload();
                });
            }
        });
    }
}

// 구글 로그인 실행
function loginWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch((error) => {
        console.error("Login failed:", error);
        alert("로그인에 실패했습니다.");
    });
}

// 서버와 데이터 동기화
async function syncUserData(uid) {
    if (!db) return;

    try {
        const docRef = db.collection('users').doc(uid);
        const doc = await docRef.get();
        const today = new Date().toDateString();
        const localStats = loadStatistics();

        let serverData = null;
        if (doc.exists) {
            serverData = doc.data();
            const serverStats = serverData.stats || {};

            const mergedStats = {
                played: Math.max(localStats.played, serverStats.played || 0),
                won: Math.max(localStats.won, serverStats.won || 0),
                currentStreak: Math.max(localStats.currentStreak, serverStats.currentStreak || 0),
                maxStreak: Math.max(localStats.maxStreak, serverStats.maxStreak || 0),
                guessDistribution: serverStats.guessDistribution || localStats.guessDistribution || [0, 0, 0, 0, 0]
            };

            saveStatistics(mergedStats);

            // 오늘 이미 참여했는지 확인
            if (serverData.lastPlayedDate === today) {
                const localState = loadGameState();
                // 서버 기록이 있는데 로컬 상태가 일치하지 않으면 동기화 (또는 로컬이 이미 끝났는데 서버와 다를 경우)
                if (!localState || localState.gameStatus === 'playing') {
                    const newState = {
                        date: today,
                        wordLength: localState ? localState.wordLength : 3, // 기본값
                        guesses: localState ? localState.guesses : [],
                        gameStatus: serverData.todayAttempts <= 6 ? 'won' : 'lost',
                        evaluations: localState ? localState.evaluations : []
                    };
                    saveGameState(newState);
                    window.location.reload();
                    return; // 리로드 될 것이므로 중단
                }
            } else {
                // 사용자가 오늘 참여하지 않았는데 로컬 상태가 "종료"라면 이전 계정의 흔적이므로 리셋
                const localState = loadGameState();
                if (localState && localState.gameStatus !== 'playing') {
                    localStorage.removeItem('longblack-wordle-state');
                    window.location.reload();
                    return;
                }
            }
        } else {
            // 서버에 데이터가 없는 새 사용자인데 로컬 상태가 종료라면 리셋
            const localState = loadGameState();
            if (localState && localState.gameStatus !== 'playing') {
                localStorage.removeItem('longblack-wordle-state');
                window.location.reload();
                return;
            }
        }

        // 닉네임 설정 확인
        let nickname = serverData?.nickname;
        if (!nickname) {
            document.getElementById('nickname-modal')?.classList.remove('hidden');
        }

        // 기본 정보 업데이트 (항상 실행)
        await docRef.set({
            photoURL: auth.currentUser.photoURL,
            googleDisplayName: auth.currentUser.displayName
        }, { merge: true });

        if (typeof updateStatsDisplay === 'function') updateStatsDisplay();

    } catch (e) {
        console.error("Data sync failed:", e);
    }
}

// 닉네임 저장 함수
async function saveNickname() {
    const input = document.getElementById('nickname-input');
    const nickname = input.value.trim();
    const user = auth.currentUser;

    if (!user) return;
    if (nickname.length < 2 || nickname.length > 8) {
        alert('닉네임은 2~8자로 입력해주세요.');
        return;
    }

    try {
        await db.collection('users').doc(user.uid).set({
            nickname: nickname
        }, { merge: true });

        document.getElementById('nickname-modal')?.classList.add('hidden');
        alert('닉네임이 설정되었습니다.');
        if (typeof updateStatsDisplay === 'function') updateStatsDisplay();
    } catch (e) {
        console.error("Nickname save failed:", e);
        alert('닉네임 저장에 실패했습니다.');
    }
}

// 아카이빙 실행 함수
async function archiveGameResult(won, attempts) {
    const user = auth ? auth.currentUser : null;
    if (!user || !db) return;

    const stats = loadStatistics();
    const today = new Date().toDateString();

    try {
        await db.collection('users').doc(user.uid).set({
            photoURL: user.photoURL,
            stats: stats,
            lastPlayedDate: today,
            todayAttempts: won ? attempts : 7,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log("Archive success!");
    } catch (e) {
        console.error("Archive failed:", e);
    }
}

// 리더보드 데이터 가져오기 (오늘 참여자 중 시도 횟수 순)
async function fetchLeaderboard() {
    if (!db) return [];
    try {
        const today = new Date().toDateString();
        const snapshot = await db.collection('users')
            .where('lastPlayedDate', '==', today)
            .where('todayAttempts', '<=', 6)
            .orderBy('todayAttempts', 'asc')
            .limit(50)
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (e) {
        console.error("Leaderboard fetch failed:", e);
        return [];
    }
}

// 리더보드 UI 업데이트
async function updateLeaderboardDisplay() {
    const leaderboardList = document.getElementById('leaderboard-list');
    if (!leaderboardList) return;

    const rankings = await fetchLeaderboard();

    if (rankings.length === 0) {
        leaderboardList.innerHTML = '<div class="loading-spinner">오늘 정답을 맞힌 첫 번째 주인공이 되어보세요!</div>';
        return;
    }

    // 시도 횟수별 그룹화
    const groups = {};
    rankings.forEach(user => {
        const attempts = user.todayAttempts || 7; // 안전장치
        if (!groups[attempts]) groups[attempts] = [];
        groups[attempts].push(user);
    });

    // 성공한 사람(1~6회)만 필터링하여 정렬
    const sortedAttempts = Object.keys(groups)
        .map(Number)
        .filter(a => a <= 6)
        .sort((a, b) => a - b);

    leaderboardList.innerHTML = sortedAttempts.map((attempts, index) => {
        const users = groups[attempts];
        const rank = index + 1;

        return `
            <div class="rank-item-group">
                <div class="rank-header" onclick="this.nextElementSibling.classList.toggle('active')">
                    <div class="rank-number">${rank}위</div>
                    <div class="rank-info">${attempts}회 만에 성공</div>
                    <div class="rank-count">${users.length}명 &gt;</div>
                </div>
                <div class="rank-users-list">
                    ${users.map(u => `
                        <div class="user-row">
                            <img class="user-photo" src="${u.photoURL || 'https://www.gravatar.com/avatar/0000?d=mp'}" alt="">
                            <div class="user-name">${u.nickname || '익명의 러너'}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}
