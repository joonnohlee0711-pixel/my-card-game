# 🍎 카드 뒤집기 게임

가장 간단한 웹 기술(HTML, CSS, vanilla JavaScript)로 만든 카드 매칭 게임입니다.

## 🎮 게임 특징

- **5x4 그리드**: 20장의 카드 (과일 이모지 10쌍)
- **익명 플레이 지원**: 로그인 없이도 게임 플레이 가능
- **점수 시스템**: 1000 - (이동 횟수 × 10) - (시간(초) × 2)
- **리더보드**: 상위 10위 점수 확인
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 지원

## 🚀 시작하기

### 1. 파일 열기

프로젝트 폴더에서 `index.html` 파일을 브라우저로 열어주세요.

```bash
# 또는 Live Server 사용 (VS Code)
# Live Server 확장 프로그램 설치 후 index.html에서 우클릭 > Open with Live Server
```

### 2. Supabase 설정 (선택사항)

점수 저장 및 리더보드 기능을 사용하려면 Supabase 설정이 필요합니다.

#### Supabase 프로젝트 생성

1. [https://supabase.com](https://supabase.com) 방문
2. 새 프로젝트 생성
3. Project Settings > API에서 URL과 anon key 복사

#### 데이터베이스 테이블 생성

Supabase SQL Editor에서 다음 쿼리 실행:

```sql
-- game_scores 테이블 생성
CREATE TABLE game_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    score INTEGER NOT NULL,
    moves INTEGER NOT NULL,
    time_seconds INTEGER NOT NULL,
    difficulty TEXT NOT NULL DEFAULT '5x4',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (성능 향상)
CREATE INDEX idx_game_scores_score ON game_scores(score DESC);
CREATE INDEX idx_game_scores_user_id ON game_scores(user_id);
CREATE INDEX idx_game_scores_difficulty ON game_scores(difficulty);

-- Row Level Security (RLS) 활성화
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자가 읽기 가능
CREATE POLICY "Anyone can read game_scores"
    ON game_scores FOR SELECT
    USING (true);

-- RLS 정책: 인증된 사용자만 자신의 점수 삽입 가능
CREATE POLICY "Users can insert their own scores"
    ON game_scores FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

#### API 키 설정

`js/supabase.js` 파일을 열고 다음 값을 교체:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // 예: https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

#### 이메일 인증 설정 (선택사항)

기본적으로 Supabase는 회원가입 시 이메일 인증을 요구합니다. 개발 중에는 이를 비활성화할 수 있습니다:

1. Supabase Dashboard > Authentication > Settings
2. "Enable email confirmations" 옵션 끄기

## 🎯 게임 방법

1. **게임 시작** 버튼을 클릭하거나 카드를 클릭하여 게임 시작
2. 두 장의 카드를 차례로 클릭
3. 같은 과일이 나오면 매칭 성공! (카드가 열린 채로 유지)
4. 다른 과일이 나오면 카드가 다시 뒤집힘
5. 모든 쌍을 찾으면 게임 완료!

## 📊 점수 계산

```
최종 점수 = 1000 - (이동 횟수 × 10) - (시간(초) × 2)
```

- 빠르게 완료할수록 높은 점수
- 적은 이동으로 완료할수록 높은 점수
- 최소 점수: 0점

## 🛠️ 기술 스택

- **HTML5**: 시맨틱 마크업
- **CSS3**: Flexbox, Grid, Transform 애니메이션
- **JavaScript**: Vanilla JS (프레임워크 없음)
- **Supabase**: 백엔드 (인증, 데이터베이스)

## 📁 프로젝트 구조

```
카드뒤집기 게임/
├── index.html              # 메인 게임 페이지
├── leaderboard.html        # 리더보드 페이지
├── css/
│   └── style.css          # 모든 스타일
├── js/
│   ├── game.js           # 게임 로직
│   ├── supabase.js       # Supabase 설정 및 API
│   └── leaderboard.js    # 리더보드 로직
├── .env.example          # 환경 변수 예제
└── README.md             # 이 파일
```

## 🎨 커스터마이징

### 카드 이모지 변경

`js/game.js` 파일에서 `fruitEmojis` 배열 수정:

```javascript
const fruitEmojis = ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍑', '🍒', '🍍'];
// 원하는 이모지로 변경 가능
```

### 점수 계산 방식 변경

`js/game.js` 파일에서 `calculateScore()` 함수 수정:

```javascript
function calculateScore() {
    const baseScore = 1000;
    const movePenalty = gameState.moves * 10;
    const timePenalty = gameState.seconds * 2;
    const finalScore = Math.max(0, baseScore - movePenalty - timePenalty);
    return finalScore;
}
```

### 그리드 크기 변경

`css/style.css` 파일에서 `.game-board` 수정:

```css
.game-board {
    grid-template-columns: repeat(5, 1fr); /* 열 개수 변경 */
}
```

그리고 `js/game.js`에서 `fruitEmojis` 배열 크기를 조정하세요.

## 🐛 문제 해결

### 리더보드가 표시되지 않음

- Supabase URL과 anon key가 올바르게 설정되었는지 확인
- 브라우저 콘솔에서 오류 메시지 확인
- Supabase 테이블이 올바르게 생성되었는지 확인

### 점수가 저장되지 않음

- 로그인이 되어 있는지 확인
- RLS 정책이 올바르게 설정되었는지 확인
- 네트워크 연결 상태 확인

### 카드가 뒤집히지 않음

- 브라우저가 CSS Transform을 지원하는지 확인
- 최신 브라우저 사용 권장 (Chrome, Firefox, Safari, Edge)

## 📝 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

## 🤝 기여

버그 리포트, 기능 제안, Pull Request 환영합니다!

## 📮 연락처

문제가 있거나 질문이 있으시면 이슈를 생성해주세요.

---

즐거운 게임 되세요! 🎮✨
