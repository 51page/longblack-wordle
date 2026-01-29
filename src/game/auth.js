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
        const userName = document.getElementById('user-name');

        if (user) {
            // 로그인 완료 상태
            if (loginBtn) loginBtn.classList.add('hidden');
            if (userProfile) userProfile.classList.remove('hidden');
            if (userPhoto) userPhoto.src = user.photoURL;
            if (userName) userName.textContent = user.displayName.split(' ')[0];

            // 아카이빙된 데이터 동기화
            await syncUserData(user.uid);
        } else {
            // 로그아웃 상태
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (userProfile) userProfile.classList.add('hidden');
        }
    });

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
            if (typeof updateStatsDisplay === 'function') updateStatsDisplay();
        }
        // 기본 정보 업데이트 (항상 실행)
        await docRef.set({
            displayName: auth.currentUser.displayName,
            photoURL: auth.currentUser.photoURL,
        }, { merge: true });
    } catch (e) {
        console.error("Data sync failed:", e);
    }
}

// 아카이빙 실행 함수
async function archiveGameResult() {
    const user = auth ? auth.currentUser : null;
    if (!user || !db) return;

    const stats = loadStatistics();
    try {
        await db.collection('users').doc(user.uid).set({
            displayName: user.displayName,
            photoURL: user.photoURL,
            stats: stats,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log("Archive success!");
    } catch (e) {
        console.error("Archive failed:", e);
    }
}

// 리더보드 데이터 가져오기
async function fetchLeaderboard() {
    if (!db) return [];
    try {
        const snapshot = await db.collection('users')
            .orderBy('stats.maxStreak', 'desc')
            .limit(5)
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
