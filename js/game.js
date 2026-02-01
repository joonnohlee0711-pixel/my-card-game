// 게임 상태
const gameState = {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    seconds: 0,
    score: 1000,
    timer: null,
    isProcessing: false,
    gameStarted: false
};

// 과일 이모지 (10쌍 = 20장)
const fruitEmojis = ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍑', '🍒', '🍍'];

// 게임 초기화
function initGame() {
    gameState.cards = [];
    gameState.flippedCards = [];
    gameState.matchedPairs = 0;
    gameState.moves = 0;
    gameState.seconds = 0;
    gameState.score = 1000;
    gameState.isProcessing = false;
    gameState.gameStarted = false;

    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }

    // 카드 생성 (각 과일 2개씩)
    const cardPairs = [];
    fruitEmojis.forEach(fruit => {
        cardPairs.push({ emoji: fruit, id: Math.random() });
        cardPairs.push({ emoji: fruit, id: Math.random() });
    });

    // 카드 섞기
    gameState.cards = shuffleArray(cardPairs);

    // UI 업데이트
    updateUI();
    renderCards();
}

// 배열 섞기 (Fisher-Yates 알고리즘)
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 카드 렌더링
function renderCards() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';

    gameState.cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.index = index;
        cardElement.dataset.emoji = card.emoji;

        cardElement.innerHTML = `
            <div class="card-face card-back">🎴</div>
            <div class="card-face card-front">${card.emoji}</div>
        `;

        cardElement.addEventListener('click', () => handleCardClick(index));
        gameBoard.appendChild(cardElement);
    });
}

// 카드 클릭 처리
function handleCardClick(index) {
    // 게임 시작
    if (!gameState.gameStarted) {
        startGame();
    }

    // 클릭 방지 조건
    if (gameState.isProcessing) return;
    if (gameState.flippedCards.includes(index)) return;
    
    const cardElement = document.querySelectorAll('.card')[index];
    if (cardElement.classList.contains('matched')) return;

    // 카드 뒤집기
    flipCard(index);

    // 2장의 카드가 뒤집혔을 때
    if (gameState.flippedCards.length === 2) {
        gameState.isProcessing = true;
        gameState.moves++;
        updateUI();
        
        setTimeout(() => {
            checkMatch();
        }, 1000);
    }
}

// 카드 뒤집기
function flipCard(index) {
    gameState.flippedCards.push(index);
    const cardElement = document.querySelectorAll('.card')[index];
    cardElement.classList.add('flipped');
}

// 매칭 확인
function checkMatch() {
    const [index1, index2] = gameState.flippedCards;
    const card1 = gameState.cards[index1];
    const card2 = gameState.cards[index2];

    const cardElements = document.querySelectorAll('.card');

    if (card1.emoji === card2.emoji) {
        // 매칭 성공
        cardElements[index1].classList.add('matched');
        cardElements[index2].classList.add('matched');
        gameState.matchedPairs++;

        // 게임 완료 확인
        if (gameState.matchedPairs === fruitEmojis.length) {
            setTimeout(() => {
                endGame();
            }, 500);
        }
    } else {
        // 매칭 실패 - 카드 뒤집기
        setTimeout(() => {
            cardElements[index1].classList.remove('flipped');
            cardElements[index2].classList.remove('flipped');
        }, 300);
    }

    gameState.flippedCards = [];
    gameState.isProcessing = false;
}

// 게임 시작
function startGame() {
    gameState.gameStarted = true;
    gameState.timer = setInterval(() => {
        gameState.seconds++;
        updateUI();
    }, 1000);
}

// 게임 종료
function endGame() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }

    // 최종 점수 계산
    const finalScore = calculateScore();
    gameState.score = finalScore;

    // 승리 모달 표시
    showWinModal();
}

// 점수 계산: 1000 - (moves × 10) - (seconds × 2)
function calculateScore() {
    const baseScore = 1000;
    const movePenalty = gameState.moves * 10;
    const timePenalty = gameState.seconds * 2;
    const finalScore = Math.max(0, baseScore - movePenalty - timePenalty);
    return finalScore;
}

// UI 업데이트
function updateUI() {
    document.getElementById('moves').textContent = gameState.moves;
    document.getElementById('timer').textContent = gameState.seconds + '초';
    
    const currentScore = calculateScore();
    document.getElementById('score').textContent = currentScore;
}

// 승리 모달 표시
function showWinModal() {
    const modal = document.getElementById('winModal');
    document.getElementById('finalMoves').textContent = gameState.moves;
    document.getElementById('finalTime').textContent = gameState.seconds;
    document.getElementById('finalScore').textContent = gameState.score;

    // 로그인된 경우 점수 저장 버튼 표시
    const saveScoreSection = document.getElementById('saveScoreSection');
    if (currentUser) {
        saveScoreSection.classList.remove('hidden');
    } else {
        saveScoreSection.classList.add('hidden');
    }

    modal.classList.remove('hidden');
}

// 모달 닫기
function closeWinModal() {
    document.getElementById('winModal').classList.add('hidden');
}

// 로그인 모달 표시
function showLoginModal() {
    document.getElementById('loginModal').classList.remove('hidden');
}

// 로그인 모달 닫기
function closeLoginModal() {
    document.getElementById('loginModal').classList.add('hidden');
}

// 이벤트 리스너
document.addEventListener('DOMContentLoaded', () => {
    // 게임 초기화
    initGame();

    // 게임 시작 버튼
    document.getElementById('startBtn').addEventListener('click', () => {
        initGame();
    });

    // 다시 시작 버튼
    document.getElementById('resetBtn').addEventListener('click', () => {
        initGame();
    });

    // 리더보드 버튼
    document.getElementById('leaderboardBtn').addEventListener('click', () => {
        window.location.href = 'leaderboard.html';
    });

    // 모달 닫기 버튼
    document.getElementById('closeModalBtn').addEventListener('click', closeWinModal);

    // 점수 저장 버튼
    document.getElementById('saveScoreBtn').addEventListener('click', async () => {
        const result = await saveScore(gameState.moves, gameState.seconds, gameState.score);
        if (!result.error) {
            document.getElementById('saveScoreSection').classList.add('hidden');
        }
    });

    // 로그인 버튼
    document.getElementById('loginBtn').addEventListener('click', showLoginModal);

    // 로그아웃 버튼
    document.getElementById('logoutBtn').addEventListener('click', signOut);

    // 로그인 모달 닫기
    document.getElementById('closeLoginBtn').addEventListener('click', closeLoginModal);

    // 회원가입 버튼
    document.getElementById('signUpBtn').addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            alert('이메일과 비밀번호를 입력해주세요.');
            return;
        }

        await signUp(email, password);
    });

    // 로그인 버튼
    document.getElementById('signInBtn').addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            alert('이메일과 비밀번호를 입력해주세요.');
            return;
        }

        const result = await signIn(email, password);
        if (!result.error) {
            closeLoginModal();
        }
    });
});
