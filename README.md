# 고바노트 (Goba.note)

빈 칸에 적으면 AI가 글의 종류를 판단하고, 그 글에 필요한 기능만 조용히 열어 주는 한국어 노트 앱.

일상 · 할 일 · 기도 · 일기 · 감사 · 말씀을 한 곳에 적고, 쓰기 전에 폴더나 템플릿을 고르지 않아도 됩니다.

> 사라진 원본 Expo 소스를 명세서에 근거해 다시 만드는 복구 프로젝트입니다.
> 기능 기준은 [`GobaNote_Recovery_Spec.md`](GobaNote_Recovery_Spec.md) 하나뿐입니다.

## 지금 상태

| 단계 | 내용 | 상태 |
|---|---|---|
| 0 | 폴더 점검, Git 초기화, 기존 DB 읽기 전용 점검, 첫 커밋·push | **완료** |
| 1 | Expo 앱 뼈대, 로그인, 하단 탭, 노트 CRUD | **코드 완료 · 실데이터 검증 대기** |
| 2 | `classify-note` 분류, 분류별 기능(할 일·기도·감사·말씀) | 대기 |
| 3 | 검색, 알림, 오류·빈 상태 처리, 디자인 다듬기, 웹 배포 | 대기 |
| 4 | 사용자 확인 후 확장 | 대기 |

**다음에 할 일과 막혀 있는 지점은 [`docs/HANDOFF.md`](docs/HANDOFF.md) 에 정리돼 있습니다.**

## 처음 시작하기

이 저장소에는 `node_modules` 와 `.env` 가 들어 있지 않습니다. 두 가지를 먼저 준비합니다.

### 1. 의존성 설치

```bash
npm install
```

### 2. `.env` 만들기

```bash
cp .env.example .env
```

`.env` 를 열고 두 값을 채웁니다.

| 값 | 어디서 구하나 |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase 대시보드 프로젝트 화면 맨 위 주소 |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `Project Settings` → `API Keys` 의 **`anon` `public`** (또는 Publishable key) |

`service_role` 이나 **Secret key** 는 절대 쓰지 않습니다. `.env` 는 Git 에 올라가지 않습니다.

Supabase 프로젝트는 무료 플랜이라 일주일쯤 쓰지 않으면 잠듭니다.
대시보드에 **Paused** 로 나오면 **Restore** 를 누르면 됩니다. 데이터는 사라지지 않습니다.

### 3. 실행

```bash
npm run web
```

폰에서 Expo Go 로 볼 때는 `npm start` 를 씁니다.

## 자주 쓰는 명령

| 명령 | 하는 일 |
|---|---|
| `npm run web` | 웹 개발 서버 |
| `npm start` | Expo 개발 서버 (폰 Expo Go 용) |
| `npx tsc --noEmit` | 타입 검사 |
| `npm run build:web` | 배포용 정적 빌드 → `dist/` |

Windows 에서 `expo export` 가 출력 없이 `exit 107` 로 끝나면 빌드 실패가 아니라
터미널 환경 문제입니다. `CI=1` 을 주고 다시 실행하면 됩니다.

## 기술 구조

| 구분 | 선택 |
|---|---|
| 앱 | Expo SDK 57 + React Native 0.86 + TypeScript (strict) |
| 라우팅 | expo-router (파일 기반) |
| 데이터·로그인 | Supabase Auth + Postgres |
| AI 분류 | Supabase Edge Function `classify-note` → Gemini |
| 웹 배포 | `expo export --platform web` → Render **Static Site** |

Gemini API 키는 Edge Function 의 서버 비밀값으로만 씁니다. 앱 번들에 넣지 않습니다.

```bash
supabase secrets set GEMINI_API_KEY=...
```

## 폴더

```
GobaNote_Recovery_Spec.md     기능 기준 문서 (유일한 근거)
CLAUDE.md                     AI 어시스턴트용 작업 지침
docs/HANDOFF.md               현재 진행 상황과 다음 할 일
docs/step0-supabase-audit.md  기존 DB 읽기 전용 점검 결과
docs/reference/               참고 보관 자료 (Git 추적 제외)

src/app/                      화면 (expo-router)
src/components/               공용 UI
src/lib/                      Supabase 연결, 인증, 노트 CRUD, 분류 정의
src/constants/theme.ts        색·간격 기준
```

## 안전 규칙

- API 키·anon key·Gemini 키·access token 을 커밋이나 소스코드에 직접 쓰지 않습니다.
- 기존 Supabase `notes` 데이터(28행)는 삭제·초기화·마이그레이션하지 않습니다.
  스키마 변경은 컬럼 추가만, 승인 후에 합니다.
- 기능 단위로 커밋하고 원격 저장소에 push 합니다.
