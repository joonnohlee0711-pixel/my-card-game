// 리더보드 로드
async function loadLeaderboard() {
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '<tr><td colspan="6" class="loading">로딩 중...</td></tr>';

    const { data, error } = await getLeaderboard(10);

    if (error) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">리더보드를 불러올 수 없습니다.</td></tr>';
        return;
    }

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">아직 기록이 없습니다.</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    data.forEach((score, index) => {
        const row = document.createElement('tr');
        const rank = index + 1;
        
        // 상위 3명에게 특별 클래스 추가
        if (rank === 1) row.classList.add('rank-1');
        else if (rank === 2) row.classList.add('rank-2');
        else if (rank === 3) row.classList.add('rank-3');

        // 날짜 포맷팅
        const date = new Date(score.created_at);
        const formattedDate = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;

        // 이메일 표시 (처음 부분만)
        const displayEmail = score.email === '익명' ? '익명' : score.email.split('@')[0];

        row.innerHTML = `
            <td>${getRankEmoji(rank)} ${rank}</td>
            <td>${displayEmail}</td>
            <td><strong>${score.score}</strong></td>
            <td>${score.moves}</td>
            <td>${score.time_seconds}초</td>
            <td>${formattedDate}</td>
        `;

        tbody.appendChild(row);
    });
}

// 순위 이모지
function getRankEmoji(rank) {
    switch(rank) {
        case 1: return '🥇';
        case 2: return '🥈';
        case 3: return '🥉';
        default: return '';
    }
}

// 이벤트 리스너
document.addEventListener('DOMContentLoaded', () => {
    // 리더보드 로드
    loadLeaderboard();

    // 게임으로 돌아가기 버튼
    document.getElementById('backBtn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});
