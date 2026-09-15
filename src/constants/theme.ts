/**
 * 고바노트 색·간격 기준 (명세서 8장)
 *
 *   진한 크림색 바탕 + 숲색/진한 그린 강조색
 *   일반 생산성 앱보다 부드럽고 조용한 느낌
 *
 * 다크 모드는 두지 않는다. 크림 바탕이 정체성이라 색을 뒤집으면 성격이 바뀐다.
 * app.json 의 userInterfaceStyle 도 "light" 로 고정돼 있다.
 */

export const colors = {
  /** 화면 바탕. 흰색이 아니라 진한 크림 */
  bg: '#F4EEDF',
  /** 카드·입력칸 바탕. 바탕보다 한 톤 밝게 */
  surface: '#FBF7EC',
  /** 눌린 상태나 비활성 영역 */
  surfaceMuted: '#EDE5D2',

  /** 강조색. 숲색 */
  forest: '#2F5D45',
  /** 눌렀을 때의 진한 숲색 */
  forestDeep: '#1E4433',
  /** 옅은 숲색 바탕. 선택된 칩 등 */
  forestSoft: '#DDE7E0',

  /** 본문 글자 */
  text: '#2A2622',
  /** 보조 설명 글자 */
  textMuted: '#6B6459',
  /** 더 흐린 글자. 안내문·빈 상태 */
  textFaint: '#9A9184',

  /** 경계선 */
  border: '#DFD5BE',
  borderStrong: '#C9BC9F',

  /** 위험. 삭제 */
  danger: '#A4402E',
  /** 완료 표시 */
  done: '#4A7C59',

  white: '#FFFFFF',
} as const;

/** 터치 영역은 최소 44pt. 명세서 8장의 "큰 터치 영역" */
export const touchMin = 44;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

/** 폰에서 읽기 좋은 크기. 본문을 16 아래로 내리지 않는다 */
export const fontSize = {
  caption: 13,
  body: 16,
  bodyLarge: 17,
  title: 20,
  heading: 26,
} as const;
