# 📘 Supabase 설정 가이드

이 가이드는 카드 뒤집기 게임에서 Supabase를 설정하는 방법을 단계별로 안내합니다.

## 🎯 Supabase란?

Supabase는 오픈소스 Firebase 대안으로, PostgreSQL 데이터베이스, 인증, 스토리지 등을 제공하는 백엔드 서비스입니다.

## 📋 사전 준비

- Supabase 계정 (무료)
- 이메일 주소

## 🚀 단계별 설정

### 1단계: Supabase 프로젝트 생성

1. [https://supabase.com](https://supabase.com) 방문
2. "Start your project" 클릭
3. GitHub, Google 등으로 로그인
4. "New Project" 클릭
5. 다음 정보 입력:
   - **Name**: 카드뒤집기게임 (원하는 이름)
   - **Database Password**: 강력한 비밀번호 생성 (저장해두세요!)
   - **Region**: Northeast Asia (Seoul) 또는 가까운 지역 선택
   - **Pricing Plan**: Free 선택
6. "Create new project" 클릭
7. 프로젝트 생성 대기 (약 2분 소요)

### 2단계: API 키 가져오기

1. 프로젝트 대시보드에서 좌측 하단 ⚙️ **Settings** 클릭
2. **API** 메뉴 선택
3. 다음 정보 복사:
   - **Project URL**: `https://xxxxx.supabase.co` 형식
   - **anon public**: `eyJ...` 형식의 긴 키

### 3단계: 게임에 API 키 설정

1. 프로젝트 폴더에서 `js/supabase.js` 파일 열기
2. 다음 부분 수정:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // 복사한 Project URL로 교체
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // 복사한 anon public key로 교체
```

예시:
```javascript
const SUPABASE_URL = 'https://abcdefghijk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

3. 파일 저장

### 4단계: 데이터베이스 테이블 생성

1. Supabase 대시보드 좌측에서 🗄️ **SQL Editor** 클릭
2. "+ New query" 버튼 클릭
3. 다음 SQL 코드를 복사하여 붙여넣기:

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
CREATE INDEX idx_game_scores_created_at ON game_scores(created_at DESC);

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

4. 우측 하단 **Run** 버튼 클릭 (또는 Ctrl+Enter)
5. "Success. No rows returned" 메시지 확인

### 5단계: 이메일 인증 설정 (개발용)

개발 중에는 이메일 인증을 비활성화하는 것이 편리합니다.

1. 좌측 메뉴에서 🔐 **Authentication** 클릭
2. **Settings** 탭 선택
3. "Enable email confirmations" 찾기
4. 토글을 **OFF**로 변경
5. 하단 **Save** 버튼 클릭

> ⚠️ **주의**: 실제 배포 시에는 이메일 인증을 다시 활성화하는 것이 좋습니다.

### 6단계: 테스트

1. 게임 페이지 새로고침 (`index.html`)
2. "로그인" 버튼 클릭
3. "회원가입" 버튼으로 테스트 계정 생성:
   - 이메일: test@example.com
   - 비밀번호: test1234 (6자 이상)
4. 로그인 성공 확인
5. 게임 플레이 후 점수 저장
6. "리더보드" 버튼으로 저장된 점수 확인

## ✅ 설정 확인

### 올바르게 설정되었는지 확인하는 방법

1. **API 키 확인**:
   - 브라우저 콘솔(F12) 열기
   - 콘솔에 "Supabase가 설정되지 않았습니다" 메시지가 없어야 함

2. **테이블 확인**:
   - Supabase 대시보드 > Table Editor
   - `game_scores` 테이블이 보여야 함

3. **인증 확인**:
   - 회원가입 후 로그인 성공
   - 우측 상단에 이메일 표시

4. **점수 저장 확인**:
   - 게임 완료 후 "점수 저장" 버튼 클릭
   - "점수가 저장되었습니다!" 알림
   - Supabase 대시보드 > Table Editor > game_scores에서 데이터 확인

## 🔧 고급 설정 (선택사항)

### 이메일 템플릿 커스터마이징

1. Authentication > Email Templates
2. "Confirm signup" 템플릿 선택
3. 이메일 내용 수정
4. Save 클릭

### OAuth 제공자 추가 (Google, GitHub 등)

1. Authentication > Settings > Auth Providers
2. 원하는 제공자 활성화
3. Client ID와 Secret 입력
4. Save 클릭

### 데이터베이스 백업 설정

1. Database > Backups
2. 자동 백업 설정
3. 복원 포인트 확인

## 🐛 문제 해결

### "Failed to fetch" 오류

**원인**: API 키가 올바르지 않거나 네트워크 문제

**해결**:
1. `js/supabase.js`에서 URL과 키 다시 확인
2. Supabase 대시보드에서 프로젝트가 활성 상태인지 확인
3. 브라우저 콘솔에서 자세한 오류 메시지 확인

### "Invalid API key" 오류

**원인**: anon key가 아닌 service_role key를 사용했거나 키가 만료됨

**해결**:
1. Supabase Settings > API에서 **anon public** 키를 사용하는지 확인
2. service_role key는 절대 클라이언트 코드에 사용하지 말 것

### "Permission denied" 오류

**원인**: RLS 정책이 올바르게 설정되지 않음

**해결**:
1. SQL Editor에서 RLS 정책 쿼리 다시 실행
2. Table Editor > game_scores > RLS 정책 확인

### 회원가입 후 이메일 확인이 필요하다는 메시지

**원인**: 이메일 인증이 활성화되어 있음

**해결**:
1. Authentication > Settings
2. "Enable email confirmations" 끄기

## 📊 데이터베이스 스키마 설명

### game_scores 테이블

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | UUID | 고유 식별자 (자동 생성) |
| user_id | UUID | 사용자 ID (auth.users 참조) |
| score | INTEGER | 최종 점수 |
| moves | INTEGER | 이동 횟수 |
| time_seconds | INTEGER | 소요 시간 (초) |
| difficulty | TEXT | 난이도 (기본값: '5x4') |
| created_at | TIMESTAMP | 생성 시간 (자동 생성) |

### 인덱스

- `idx_game_scores_score`: 점수 기준 정렬 최적화
- `idx_game_scores_user_id`: 사용자별 조회 최적화
- `idx_game_scores_difficulty`: 난이도별 필터링 최적화
- `idx_game_scores_created_at`: 날짜 기준 정렬 최적화

## 💡 유용한 SQL 쿼리

### 상위 10위 조회

```sql
SELECT * FROM game_scores
ORDER BY score DESC, time_seconds ASC
LIMIT 10;
```

### 특정 사용자의 최고 점수

```sql
SELECT MAX(score) as best_score
FROM game_scores
WHERE user_id = 'USER_UUID';
```

### 평균 점수 및 통계

```sql
SELECT 
    COUNT(*) as total_games,
    AVG(score) as avg_score,
    AVG(moves) as avg_moves,
    AVG(time_seconds) as avg_time
FROM game_scores;
```

### 오늘의 상위 점수

```sql
SELECT * FROM game_scores
WHERE created_at::date = CURRENT_DATE
ORDER BY score DESC
LIMIT 10;
```

## 🔒 보안 권장사항

1. **API 키 노출 방지**:
   - anon key는 공개 가능 (이름 그대로 anonymous)
   - service_role key는 절대 클라이언트에 노출하지 말 것

2. **RLS 정책 필수**:
   - 모든 테이블에 RLS 활성화
   - 사용자는 자신의 데이터만 수정 가능

3. **비밀번호 정책**:
   - 최소 6자 이상
   - 실제 배포 시 8자 이상 권장

4. **이메일 인증**:
   - 실제 배포 시 반드시 활성화
   - 스팸 계정 방지

## 📚 추가 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [JavaScript 클라이언트 가이드](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [인증 가이드](https://supabase.com/docs/guides/auth)

## 🎉 완료!

축하합니다! Supabase 설정이 완료되었습니다. 이제 게임에서 점수를 저장하고 리더보드를 확인할 수 있습니다.

문제가 있으면 위의 문제 해결 섹션을 참고하거나, Supabase 커뮤니티에 질문해보세요.

---

Happy coding! 🚀
