import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, radius, spacing } from '@/constants/theme';

/**
 * 아직 만들지 않은 탭 자리.
 *
 * 탭을 숨기지 않고 자리를 남겨 둔다. 명세서 5장이 여섯 탭을 요구하므로
 * 화면 구조를 미리 확정해 두고, 단계 2·3 에서 내용만 채운다.
 */
export function ComingSoon({
  title,
  body,
  stage,
}: {
  title: string;
  body: string;
  stage: string;
}) {
  return (
    <ScrollView contentContainerStyle={s.body}>
      <View style={s.card}>
        <Text style={s.stage}>{stage}</Text>
        <Text style={s.title}>{title}</Text>
        <Text style={s.text}>{body}</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { padding: spacing.lg, paddingTop: spacing.xxl },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  stage: {
    fontSize: fontSize.caption - 1,
    fontWeight: '700',
    color: colors.forest,
    backgroundColor: colors.forestSoft,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  title: { fontSize: fontSize.title, fontWeight: '700', color: colors.text, marginTop: spacing.xs },
  text: { fontSize: fontSize.body, color: colors.textMuted, lineHeight: 25 },
});
