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
                    localStorage.removeItem('longblack-wordle-state');
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

            // 계정 전환 및 오늘 참여 여부 확인
            if (serverData.lastPlayedDate === today) {
                const localState = loadGameState();
                // 서버에는 오늘 기록이 있는데 로컬이 없거나 진행중인 경우 -> 서버 기록으로 덮어씀
                if (!localState || localState.gameStatus === 'playing') {
                    const newState = {
                        date: today,
                        wordLength: localState ? localState.wordLength : 3,
                        guesses: new Array(serverData.todayAttempts || 0).fill(''), // 횟수만큼 빈 칸 채움 (UI용)
                        gameStatus: serverData.todayAttempts <= 6 ? 'won' : 'lost',
                        evaluations: []
                    };
                    saveGameState(newState);

                    // 정답 맞춘 계정이 다시 접속했을 때 플로팅 메시지 표시
                    if (typeof showMessage === 'function') {
                        setTimeout(() => showMessage('오늘 문제를 풀었습니다. 내일 또 도전하세요', 4000), 1000);
                    }

                    window.location.reload();
                    return;
                } else if (localState.gameStatus !== 'playing') {
                    // 이미 정답 맞춘 상태로 그냥 접속했을 때도 메시지 표시
                    if (typeof showMessage === 'function') {
                        setTimeout(() => showMessage('오늘 문제를 풀었습니다. 내일 또 도전하세요', 4000), 500);
                    }
                }
            } else {
                // 서버에는 오늘 기록이 없는데 로컬은 종료 상태인 경우 -> 다른 계정의 흔적이므로 리셋
                const localState = loadGameState();
                if (localState && localState.gameStatus !== 'playing') {
                    localStorage.removeItem('longblack-wordle-state');
                    window.location.reload();
                    return;
                }
            }
        } else {
            // 서버에 데이터가 아예 없는 새 사용자인 경우
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

        // 기본 정보 업데이트
        await docRef.set({
            photoURL: auth.currentUser.photoURL,
            googleDisplayName: auth.currentUser.displayName,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
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
        console.log("Archive success with attempts:", attempts);

        // 데이터 저장 직후 리더보드 갱신 유도
        if (typeof updateLeaderboardDisplay === 'function') {
            setTimeout(updateLeaderboardDisplay, 500);
        }
    } catch (e) {
        console.error("Archive failed:", e);
    }
}

// 리더보드 데이터 가져오기 (보다 안정적인 쿼리 방식)
async function fetchLeaderboard() {
    if (!db) return [];
    try {
        const today = new Date().toDateString();
        // 복합 인덱스 오류를 피하기 위해 equality 쿼리만 사용하고 나머지는 클라이언트에서 처리
        const snapshot = await db.collection('users')
            .where('lastPlayedDate', '==', today)
            .limit(100)
            .get();

        const users = snapshot.docs.map(doc => doc.data());
        // 정답자만 필터링 (1~6회 시도) 후 정렬
        return users
            .filter(u => u.todayAttempts && u.todayAttempts <= 6)
            .sort((a, b) => a.todayAttempts - b.todayAttempts);
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
        const attempts = user.todayAttempts;
        if (!groups[attempts]) groups[attempts] = [];
        groups[attempts].push(user);
    });

    const sortedAttempts = Object.keys(groups).sort((a, b) => Number(a) - Number(b));

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
