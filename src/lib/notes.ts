/**
 * notes 테이블 읽기·쓰기 (명세서 4장)
 *
 * 컬럼 구성은 단계 0 점검 보고서 docs/step0-supabase-audit.md 를 따른다.
 * 기존 28개 노트가 이 스키마로 들어 있으므로 컬럼 이름·타입을 바꾸지 않는다.
 *
 * id 가 uuid 가 아니라 text 인 것도 기존 데이터 그대로다.
 * 앱이 id 를 만들어 넣는다.
 */
import * as Crypto from 'expo-crypto';

import type { Category } from './categories';
import { supabase } from './supabase';

/** DB 에 실제로 있는 컬럼만 나열한다. 없는 컬럼을 select 하면 통째로 실패한다. */
export type Note = {
  id: string;
  user_id: string;
  title: string | null;
  content: string | null;
  category: string | null;
  created_at: string;
  updated_at: string | null;
  deadline_at: string | null;
  notification_id: string | null;
  is_done: boolean | null;
  category_confidence: number | null;
  category_reason: string | null;
};

const COLUMNS =
  'id, user_id, title, content, category, created_at, updated_at, deadline_at, notification_id, is_done, category_confidence, category_reason';

export function newNoteId(): string {
  return Crypto.randomUUID();
}

/** 최신순 목록. category 를 주면 그 분류만. (명세서 5장 "날짜순 목록") */
export async function listNotes(category?: Category): Promise<Note[]> {
  let query = supabase.from('notes').select(COLUMNS).order('created_at', { ascending: false });
  if (category) query = query.eq('category', category);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Note[];
}

export async function getNote(id: string): Promise<Note | null> {
  const { data, error } = await supabase.from('notes').select(COLUMNS).eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as Note) ?? null;
}

type CreateInput = {
  title: string;
  content: string;
  category: Category;
};

export async function createNote(input: CreateInput): Promise<Note> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('로그인이 필요합니다.');

  const now = new Date().toISOString();
  const row = {
    id: newNoteId(),
    user_id: auth.user.id,
    title: input.title.trim(),
    content: input.content.trim(),
    category: input.category,
    created_at: now,
    updated_at: now,
    is_done: input.category === 'todo' ? false : null,
  };

  const { data, error } = await supabase.from('notes').insert(row).select(COLUMNS).single();
  if (error) throw error;

  try {
    const { error: classificationError } = await supabase.functions.invoke('classify-note', {
      body: { note_id: row.id },
    });

    if (classificationError) {
      console.warn('[고바노트] classify-note 호출 실패:', classificationError);
    }
  } catch (classificationError) {
    console.warn('[고바노트] classify-note 요청 중 예외:', classificationError);
  }

  return data as Note;
}

/** 넘긴 필드만 고친다. updated_at 은 항상 함께 갱신한다. */
export async function updateNote(
  id: string,
  patch: Partial<Pick<Note, 'title' | 'content' | 'category' | 'deadline_at' | 'is_done'>>,
): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(COLUMNS)
    .single();
  if (error) throw error;
  return data as Note;
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw error;
}

/** 챙김 탭: 아직 완료하지 않은 할 일 (명세서 6.2) */
export async function listOpenTodos(): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select(COLUMNS)
    .eq('category', 'todo')
    .or('is_done.is.null,is_done.eq.false')
    // 기한이 있는 것부터, 없는 것은 뒤로
    .order('deadline_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Note[];
}

/**
 * 삭제 되돌리기 (명세서 5장 "가능하면 최근 삭제 되돌리기를 지원한다")
 *
 * id 가 앱에서 만든 text 값이라 같은 id 로 되살릴 수 있다.
 * 목록의 다른 노트에서 이 노트를 가리키는 것이 없으므로 그대로 다시 넣으면 된다.
 */
export async function restoreNote(note: Note): Promise<Note> {
  const { data, error } = await supabase.from('notes').insert(note).select(COLUMNS).single();
  if (error) throw error;
  return data as Note;
}
