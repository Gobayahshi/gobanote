import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Button, Chip } from '@/components/ui';
import { colors, fontSize, radius, spacing, touchMin } from '@/constants/theme';
import { CATEGORIES, CATEGORY_INFO, type Category } from '@/lib/categories';
import { createNote } from '@/lib/notes';

/**
 * 쓰기 화면 (명세서 5장 "쓰기 화면")
 *
 * 최우선 원칙대로, 빈 칸이 먼저 나온다. 쓰기 전에 아무것도 고르지 않아도 된다.
 *
 * 단계 1 에서는 AI 분류를 아직 붙이지 않았다. 지금은 분류를 고르지 않으면
 * 일상으로 저장되고, 단계 2 에서 classify-note 가 이 자리를 채운다.
 */
export default function WriteScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category>('daily');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = title.trim().length > 0 || content.trim().length > 0;

  async function save() {
    if (!canSave || saving) return;

    setSaving(true);
    setError(null);
    try {
      await createNote({ title, content, category });
      setTitle('');
      setContent('');
      setCategory('daily');
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장하지 못했습니다.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={s.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}>
      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
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
          placeholder="여기에 그냥 적으세요"
          placeholderTextColor={colors.textFaint}
          multiline
          textAlignVertical="top"
          editable={!saving}
        />

        <View style={s.section}>
          <Text style={s.sectionLabel}>분류</Text>
          <Text style={s.sectionHint}>
            고르지 않으면 일상으로 저장됩니다. 나중에 언제든 바꿀 수 있습니다.
          </Text>
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

        {error ? <Text style={s.error}>{error}</Text> : null}

        <Button label="저장" onPress={save} loading={saving} disabled={!canSave} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
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
    minHeight: 200,
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
  error: { color: colors.danger, fontSize: fontSize.caption, lineHeight: 20 },
});
