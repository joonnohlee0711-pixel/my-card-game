// Supabase 설정
// 사용하기 전에 자신의 Supabase 프로젝트 정보로 변경해야 합니다
const SUPABASE_URL = 'https://ckixkizblskfdkjagadh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNraXhraXpibHNrZmRramFnYWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5MzExNTUsImV4cCI6MjA4NTUwNzE1NX0.mtJ32rr55Llr8ed12Ofv9znda2fLv1-EODDeAVy7Ouo';

let supabase = null;
let currentUser = null;

// Supabase 클라이언트 초기화
function initSupabase() {
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
        console.warn('Supabase가 설정되지 않았습니다. 익명 플레이만 가능합니다.');
        return false;
    }

    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        checkAuth();
        return true;
    } catch (error) {
        console.error('Supabase 초기화 오류:', error);
        return false;
    }
}

// 인증 상태 확인
async function checkAuth() {
    if (!supabase) return;

    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            currentUser = session.user;
            updateUIForLoggedInUser();
        } else {
            currentUser = null;
            updateUIForLoggedOutUser();
        }
    } catch (error) {
        console.error('인증 확인 오류:', error);
    }
}

// 로그인한 사용자 UI 업데이트
function updateUIForLoggedInUser() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userDisplay = document.getElementById('userDisplay');

    if (loginBtn) loginBtn.classList.add('hidden');
    if (logoutBtn) logoutBtn.classList.remove('hidden');
    if (userDisplay) {
        userDisplay.textContent = currentUser.email;
        userDisplay.classList.remove('hidden');
    }
}

// 로그아웃한 사용자 UI 업데이트
function updateUIForLoggedOutUser() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userDisplay = document.getElementById('userDisplay');

    if (loginBtn) loginBtn.classList.remove('hidden');
    if (logoutBtn) logoutBtn.classList.add('hidden');
    if (userDisplay) userDisplay.classList.add('hidden');
}

// 회원가입
async function signUp(email, password) {
    if (!supabase) {
        alert('Supabase가 설정되지 않았습니다.');
        return { error: 'Supabase not configured' };
    }

    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) throw error;
        
        alert('회원가입이 완료되었습니다! 이메일을 확인해주세요.');
        return { data, error: null };
    } catch (error) {
        console.error('회원가입 오류:', error);
        alert('회원가입 실패: ' + error.message);
        return { data: null, error };
    }
}

// 로그인
async function signIn(email, password) {
    if (!supabase) {
        alert('Supabase가 설정되지 않았습니다.');
        return { error: 'Supabase not configured' };
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        currentUser = data.user;
        updateUIForLoggedInUser();
        alert('로그인 성공!');
        return { data, error: null };
    } catch (error) {
        console.error('로그인 오류:', error);
        alert('로그인 실패: ' + error.message);
        return { data: null, error };
    }
}

// 로그아웃
async function signOut() {
    if (!supabase) return;

    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        currentUser = null;
        updateUIForLoggedOutUser();
        alert('로그아웃되었습니다.');
    } catch (error) {
        console.error('로그아웃 오류:', error);
        alert('로그아웃 실패: ' + error.message);
    }
}

// 점수 저장
async function saveScore(moves, timeSeconds, score) {
    if (!supabase) {
        alert('Supabase가 설정되지 않아 점수를 저장할 수 없습니다.');
        return { error: 'Supabase not configured' };
    }

    if (!currentUser) {
        alert('점수를 저장하려면 로그인이 필요합니다.');
        return { error: 'Not authenticated' };
    }

    try {
        const { data, error } = await supabase
            .from('game_scores')
            .insert([
                {
                    user_id: currentUser.id,
                    moves: moves,
                    time_seconds: timeSeconds,
                    score: score,
                    difficulty: '5x4'
                }
            ]);

        if (error) throw error;

        alert('점수가 저장되었습니다!');
        return { data, error: null };
    } catch (error) {
        console.error('점수 저장 오류:', error);
        alert('점수 저장 실패: ' + error.message);
        return { data: null, error };
    }
}

// 리더보드 가져오기
async function getLeaderboard(limit = 10) {
    if (!supabase) {
        console.warn('Supabase가 설정되지 않았습니다.');
        return { data: [], error: 'Supabase not configured' };
    }

    try {
        const { data, error } = await supabase
            .from('game_scores')
            .select(`
                id,
                score,
                moves,
                time_seconds,
                created_at,
                user_id
            `)
            .eq('difficulty', '5x4')
            .order('score', { ascending: false })
            .order('time_seconds', { ascending: true })
            .limit(limit);

        if (error) throw error;

        // 사용자 이메일 가져오기 (간단한 버전)
        const scoresWithEmails = data.map(score => ({
            ...score,
            email: score.user_id || '익명'
        }));

        return { data: scoresWithEmails, error: null };
    } catch (error) {
        console.error('리더보드 조회 오류:', error);
        return { data: [], error };
    }
}

// 페이지 로드 시 초기화
if (typeof window !== 'undefined') {
    initSupabase();
}
