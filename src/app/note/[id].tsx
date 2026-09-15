import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { formatDate } from '@/components/note-row';
import { Button, Chip, ConfirmDialog, EmptyState, ErrorNotice, Loading } from '@/components/ui';
import { colors, fontSize, radius, spacing, touchMin } from '@/constants/theme';
import { CATEGORIES, CATEGORY_INFO, toCategory, type Category } from '@/lib/categories';
import { deleteNote, getNote, restoreNote, updateNote, type Note } from '@/lib/notes';

/**
 * 노트 상세 (명세서 5장)
 *
 * 상세에서 바로 고칠 수 있게 했다. 보기 화면과 수정 화면을 나누면
 * "고치려면 어디를 눌러야 하나"를 한 번 더 배워야 한다.
 *
 * 분류별 추가 조작(할 일 기한, 기도 응답 상태 등)은 단계 2 에서 붙는다.
 */
export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category>('daily');

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const [confirming, setConfirming] = useState(false);
  const [deleted, setDeleted] = useState<Note | null>(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setLoadError(null);

    getNote(id)
      .then((n) => {
        if (!alive) return;
        setNote(n);
        if (n) {
          setTitle(n.title ?? '');
          setContent(n.content ?? '');
          setCategory(toCategory(n.category));
        }
      })
      .catch((e) => {
        if (alive) setLoadError(e instanceof Error ? e.message : '노트를 불러오지 못했습니다.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    navigation.setOptions({ title: note ? CATEGORY_INFO[category].label : '노트' });
  }, [navigation, note, category]);

  const dirty =
    note !== null &&
    (title !== (note.title ?? '') ||
      content !== (note.content ?? '') ||
      category !== toCategory(note.category));

  async function save() {
    if (!note || !dirty || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await updateNote(note.id, {
        title: title.trim(),
        content: content.trim(),
        category,
      });
      setNote(updated);
      setSavedAt(Date.now());
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : '저장하지 못했습니다.');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!note) return;
    setConfirming(false);
    try {
      await deleteNote(note.id);
      setDeleted(note);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : '삭제하지 못했습니다.');
    }
  }

  async function undo() {
    if (!deleted) return;
    setRestoring(true);
    try {
      const back = await restoreNote(deleted);
      setNote(back);
      setDeleted(null);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : '되돌리지 못했습니다.');
    } finally {
      setRestoring(false);
    }
  }

  if (loading) return <Loading label="불러오는 중" />;

  if (loadError) {
    return <ErrorNotice message={loadError} onRetry={() => router.replace(`/note/${id}`)} />;
  }

  if (deleted) {
    // 삭제 직후. 되돌릴 기회를 준다 (명세서 5장)
    return (
      <View style={s.deletedWrap}>
        <Text style={s.deletedTitle}>노트를 삭제했습니다</Text>
        <Text style={s.deletedBody}>
          실수로 지우셨다면 지금 되돌릴 수 있습니다.{'\n'}
          이 화면을 벗어나면 되돌릴 수 없습니다.
        </Text>
        {saveError ? <Text style={s.error}>{saveError}</Text> : null}
        <Button label="되돌리기" onPress={undo} loading={restoring} />
        <Button label="목록으로" variant="secondary" onPress={() => router.replace('/notes')} />
      </View>
    );
  }

  if (!note) {
    return (
      <EmptyState
        title="노트를 찾을 수 없습니다"
        body="이미 삭제되었거나 다른 계정의 노트일 수 있습니다."
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={s.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}>
      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        <Text style={s.meta}>
          {formatDate(note.created_at)}에 작성
          {note.updated_at && note.updated_at !== note.created_at
            ? ` · ${formatDate(note.updated_at)}에 수정`
            : ''}
        </Text>

        <TextInput
          style={s.title}
          value={title}
          onChangeText={setTitle}
          placeholder="제목 (비워도 됩니다)"
          placeholderTextColor={colors.textFaint}
          editable={!saving}
        />

        <TextInput
          style={s.content}
          value={content}
          onChangeText={setContent}
          placeholder="내용"
          placeholderTextColor={colors.textFaint}
          multiline
          textAlignVertical="top"
          editable={!saving}
        />

        <View style={s.section}>
          <Text style={s.sectionLabel}>분류</Text>
          <Text style={s.sectionHint}>분류가 맞지 않으면 눌러서 바꿀 수 있습니다.</Text>
          <View style={s.chips}>
            {CATEGORIES.map((c) => (
              <Chip
                key={c}
                label={CATEGORY_INFO[c].label}
                selected={category === c}
                onPress={() => setCategory(c)}
              />
            ))}
          </View>
        </View>

        {note.category_reason ? (
          <View style={s.reason}>
            <Text style={s.reasonLabel}>
              AI 분류 이유
              {note.category_confidence != null
                ? ` · 확신도 ${Math.round(note.category_confidence)}`
                : ''}
            </Text>
            <Text style={s.reasonText}>{note.category_reason}</Text>
          </View>
        ) : null}

        {saveError ? <Text style={s.error}>{saveError}</Text> : null}
        {savedAt && !dirty ? <Text style={s.saved}>저장되었습니다</Text> : null}

        <Button label="저장" onPress={save} loading={saving} disabled={!dirty} />
        <Button label="삭제" variant="danger" onPress={() => setConfirming(true)} />
      </ScrollView>

      <ConfirmDialog
        visible={confirming}
        title="이 노트를 삭제할까요?"
        message="삭제한 뒤 바로 되돌릴 수 있습니다."
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      />
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  meta: { fontSize: fontSize.caption, color: colors.textFaint },
  title: {
    minHeight: touchMin,
    fontSize: fontSize.title,
    fontWeight: '600',
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  content: {
    minHeight: 220,
    fontSize: fontSize.bodyLarge,
    lineHeight: 26,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  section: { gap: spacing.sm, marginTop: spacing.sm },
  sectionLabel: { fontSize: fontSize.caption, fontWeight: '600', color: colors.textMuted },
  sectionHint: { fontSize: fontSize.caption, color: colors.textFaint, lineHeight: 19 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  reason: {
    backgroundColor: colors.forestSoft,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  reasonLabel: { fontSize: fontSize.caption - 1, fontWeight: '600', color: colors.forest },
  reasonText: { fontSize: fontSize.caption + 1, color: colors.text, lineHeight: 20 },
  error: { color: colors.danger, fontSize: fontSize.caption, lineHeight: 20 },
  saved: { color: colors.done, fontSize: fontSize.caption },
  deletedWrap: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.xl,
    justifyContent: 'center',
    gap: spacing.md,
  },
  deletedTitle: { fontSize: fontSize.title, fontWeight: '700', color: colors.text },
  deletedBody: { fontSize: fontSize.body, color: colors.textMuted, lineHeight: 24 },
});
