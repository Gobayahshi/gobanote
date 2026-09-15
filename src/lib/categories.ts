/**
 * 여섯 분류 (명세서 4장 "분류 값", 6장 "분류별 기능 명세")
 *
 * DB 의 notes.category 는 text 이고 아래 코드값이 그대로 들어간다.
 * 기존 28개 노트도 이 여섯 값만 쓰고 있음을 단계 0 점검에서 확인했다.
 */

export const CATEGORIES = [
  'daily',
  'todo',
  'prayer',
  'journal',
  'gratitude',
  'scripture',
] as const;

export type Category = (typeof CATEGORIES)[number];

type CategoryInfo = {
  /** 화면에 보이는 이름. 명세서 4장의 "화면 이름" */
  label: string;
  /** 목록·상세에서 쓰는 한 줄 설명 */
  hint: string;
};

export const CATEGORY_INFO: Record<Category, CategoryInfo> = {
  daily: { label: '일상', hint: '일반 메모, 링크, 짧은 기록' },
  todo: { label: '할 일', hint: '해야 할 행동과 기한' },
  prayer: { label: '기도', hint: '기도 제목과 기도 요청' },
  journal: { label: '일기', hint: '하루의 감정과 성찰' },
  gratitude: { label: '감사', hint: '감사 기록' },
  scripture: { label: '말씀', hint: '성경 구절과 묵상' },
};

/** DB 에서 온 값이 여섯 분류에 없거나 비어 있을 때를 대비한 안전한 읽기 */
export function toCategory(value: string | null | undefined): Category {
  return CATEGORIES.includes(value as Category) ? (value as Category) : 'daily';
}

export function categoryLabel(value: string | null | undefined): string {
  return CATEGORY_INFO[toCategory(value)].label;
}

/** 기도 응답 상태 (명세서 6.3). 비어 있을 수 있다 */
export const PRAYER_ANSWERS = ['yes', 'no', 'wait'] as const;
export type PrayerAnswer = (typeof PRAYER_ANSWERS)[number];

export const PRAYER_ANSWER_LABEL: Record<PrayerAnswer, string> = {
  yes: '응답됨',
  no: '아니라고 하심',
  wait: '기다리는 중',
};
