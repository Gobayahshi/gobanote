# 고바노트 (Goba.note)

빈 칸에 적으면 AI가 글의 종류를 판단하고, 그 글에 필요한 기능만 조용히 열어 주는 한국어 노트 앱.

일상 · 할 일 · 기도 · 일기 · 감사 · 말씀을 한 곳에 적고, 쓰기 전에 폴더나 템플릿을 고르지 않아도 됩니다.

## 현재 상태

**단계 0 — 복구 준비 (진행 중)**

기능 기준 문서는 [`GobaNote_Recovery_Spec.md`](GobaNote_Recovery_Spec.md) 하나뿐이며,
모든 구현은 이 명세서를 유일한 근거로 삼습니다.

| 단계 | 내용 | 상태 |
|---|---|---|
| 0 | 폴더 점검, Git 초기화, `.gitignore` / `.env.example`, 첫 커밋·push | 진행 중 |
| 1 | Expo 앱 뼈대, 로그인, 노트 CRUD | 대기 |
| 2 | `classify-note` 분류, 분류별 기능(할 일·기도·감사·말씀) | 대기 |
| 3 | 검색, 알림, 오류·빈 상태 처리, 디자인 다듬기 | 대기 |
| 4 | 사용자 확인 후 확장 | 대기 |

## 기술 구조

| 구분 | 선택 |
|---|---|
| 모바일 앱 | Expo + React Native + TypeScript |
| 데이터·로그인 | Supabase Auth + Postgres |
| AI 분류 | Supabase Edge Function `classify-note` → Gemini API |
| 로컬 설정 | `.env` (Git 추적 제외) |

## 환경 설정

```bash
cp .env.example .env
```

`.env` 에는 `EXPO_PUBLIC_SUPABASE_URL` 과 `EXPO_PUBLIC_SUPABASE_ANON_KEY` 만 넣습니다.
Gemini API 키는 Edge Function 서버 비밀값으로만 설정하며, 앱 번들에 넣지 않습니다.

```bash
supabase secrets set GEMINI_API_KEY=...
```

## 안전 규칙

- API 키·anon key·Gemini 키·access token 을 커밋이나 소스코드에 직접 쓰지 않습니다.
- 기존 Supabase `notes` 데이터는 삭제·초기화·마이그레이션하지 않습니다. 읽기 전용 확인이 먼저입니다.
- 기능 단위로 커밋하고 원격 저장소에 push 합니다.

## 폴더

```
GobaNote_Recovery_Spec.md   기능 기준 문서 (유일한 근거)
docs/reference/             참고용 보관 자료
```
