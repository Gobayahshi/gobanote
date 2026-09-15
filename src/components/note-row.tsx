import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, radius, spacing } from '@/constants/theme';
import { categoryLabel } from '@/lib/categories';
import type { Note } from '@/lib/notes';

/** 목록에 쓰는 노트 한 줄. 제목이 비면 본문 첫 줄을 대신 보여 준다 */
export function NoteRow({ note }: { note: Note }) {
  const heading = note.title?.trim() || firstLine(note.content) || '(내용 없음)';
  const preview = note.title?.trim() ? firstLine(note.content) : secondLineOn(note.content);

  return (
    <Link href={`/note/${note.id}`} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${categoryLabel(note.category)} 노트, ${heading}`}
        style={({ pressed }) => [s.row, pressed && { backgroundColor: colors.surfaceMuted }]}>
        <View style={s.head}>
          <Text style={s.badge}>{categoryLabel(note.category)}</Text>
          <Text style={s.date}>{formatDate(note.created_at)}</Text>
        </View>

        <Text style={[s.title, note.is_done ? s.doneTitle : null]} numberOfLines={1}>
          {heading}
        </Text>

        {preview ? (
          <Text style={s.preview} numberOfLines={2}>
            {preview}
          </Text>
        ) : null}
      </Pressable>
    </Link>
  );
}

function firstLine(content: string | null): string {
  return content?.split('\n').find((l) => l.trim())?.trim() ?? '';
}

function secondLineOn(content: string | null): string {
  const lines = content?.split('\n').filter((l) => l.trim()) ?? [];
  return lines.slice(0, 2).join(' ').trim();
}

/** 오늘·어제는 말로, 그 밖은 날짜로 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';

  const today = new Date();
  const days = Math.floor(
    (startOfDay(today).getTime() - startOfDay(d).getTime()) / (1000 * 60 * 60 * 24),
  );

  if (days === 0) return '오늘';
  if (days === 1) return '어제';
  if (d.getFullYear() === today.getFullYear()) return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}`;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

const s = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: {
    fontSize: fontSize.caption - 1,
    fontWeight: '600',
    color: colors.forest,
    backgroundColor: colors.forestSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  date: { fontSize: fontSize.caption - 1, color: colors.textFaint },
  title: { fontSize: fontSize.body, fontWeight: '600', color: colors.text, marginTop: spacing.xs },
  doneTitle: { textDecorationLine: 'line-through', color: colors.textMuted },
  preview: { fontSize: fontSize.caption + 1, color: colors.textMuted, lineHeight: 20 },
});
