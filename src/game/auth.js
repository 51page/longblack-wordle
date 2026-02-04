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
        const userName = document.getElementById('user-name'); // 닉네임 표시용

        if (user) {
            // 로그인 완료 상태
            if (loginBtn) loginBtn.classList.add('hidden');
            if (userProfile) userProfile.classList.remove('hidden');
            if (userPhoto) userPhoto.src = user.photoURL;

            // 아카이빙된 데이터 동기화 및 닉네임 확인
            await syncUserData(user.uid);

            // 닉네임 확인 및 모달 표시 로직은 syncUserData 내부 혹은 여기서 처리
            // 여기서는 syncUserData가 닉네임 확인까지 하도록 유도
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
                auth.signOut();
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

        const localStats = loadStatistics();

        if (doc.exists) {
            const serverData = doc.data();
            const serverStats = serverData.stats || {};

            const mergedStats = {
                played: Math.max(localStats.played, serverStats.played || 0),
                won: Math.max(localStats.won, serverStats.won || 0),
                currentStreak: Math.max(localStats.currentStreak, serverStats.currentStreak || 0),
                maxStreak: Math.max(localStats.maxStreak, serverStats.maxStreak || 0),
                guessDistribution: serverStats.guessDistribution || localStats.guessDistribution || [0, 0, 0, 0, 0]
            };

            saveStatistics(mergedStats);

            // 오늘 이미 참여했는지 확인 (다른 기기에서 플레이한 경우)
            const today = new Date().toDateString();
            if (serverData.lastPlayedDate === today) {
                const localState = loadGameState();
                if (!localState || localState.gameStatus === 'playing') {
                    // 서버에 기록이 있는데 로컬은 진행 중이라면 종료 상태로 강제 전환
                    const newState = {
                        date: today,
                        wordLength: localState ? localState.wordLength : 4,
                        guesses: localState ? localState.guesses : [],
                        gameStatus: 'won', // 참여 완료 상태로 간주
                        evaluations: localState ? localState.evaluations : []
                    };
                    saveGameState(newState);

                    // UI 즉시 반영을 위해 페이지 새로고침 (가장 확실한 방법)
                    // 또는 initializeGame을 다시 호출할 수 있으나 상태 전이가 복잡하므로 리로드 권장
                    if (localState && localState.gameStatus === 'playing') {
                        window.location.reload();
                    }
                }
            }

            if (typeof updateStatsDisplay === 'function') updateStatsDisplay();
        }
        // 기본 정보 업데이트 (항상 실행)
        // 닉네임이 없으면 displayName(Google)을 임시로 쓰거나 비워둠.
        // 하지만 중요한 건 닉네임 설정 모달을 띄우는 것.

        let nickname = serverData?.nickname; // 서버에 저장된 닉네임 가져오기

        if (!nickname) {
            // 닉네임이 없으면 닉네임 설정 모달 띄우기
            document.getElementById('nickname-modal').classList.remove('hidden');
        } else {
            // 닉네임이 있으면 환영 메시지 등 표시 가능 (선택사항)
            // console.log(`Welcome back, ${nickname}`);
        }

        await docRef.set({
            photoURL: auth.currentUser.photoURL,
            // displayName은 구글 이름이므로 덮어쓰지 않거나, nickname과 별도로 관리
            // 여기서는 구글 이름도 일단 저장해둠
            googleDisplayName: auth.currentUser.displayName
        }, { merge: true });

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

        // 모달 닫기
        document.getElementById('nickname-modal').classList.add('hidden');
        alert('닉네임이 설정되었습니다.');

        // UI 갱신 필요시 여기서 수행
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
            todayAttempts: won ? attempts : 7, // 실패는 7회로 처리
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
            .where('todayAttempts', '<=', 6) // 성공한 사람만
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

    // 시도 횟수별로 그룹화
    const groups = {};
    rankings.forEach(user => {
        const attempts = user.todayAttempts;
        if (!groups[attempts]) groups[attempts] = [];
        groups[attempts].push(user);
    });

    const sortedAttempts = Object.keys(groups).sort((a, b) => a - b);

    leaderboardList.innerHTML = sortedAttempts.map((attempts, index) => {
        const users = groups[attempts];
        const rank = index + 1;

        return `
            <div class="rank-item-group">
                <div class="rank-header" onclick="this.nextElementSibling.classList.toggle('active')">
                    <div class="rank-number">${rank}위</div>
                    <div class="rank-info">${attempts}회 만에 성공</div>
                    <div class="rank-count">${users.length}명 ></div>
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
