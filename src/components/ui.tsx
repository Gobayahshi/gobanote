/**
 * 화면마다 반복되는 조각들. 명세서 8장의 색·터치 크기 기준을 여기서 지킨다.
 */
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { colors, fontSize, radius, spacing, touchMin } from '@/constants/theme';

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        s.btn,
        variant === 'primary' && { backgroundColor: pressed ? colors.forestDeep : colors.forest },
        variant === 'secondary' && {
          backgroundColor: pressed ? colors.surfaceMuted : colors.surface,
          borderWidth: 1,
          borderColor: colors.borderStrong,
        },
        variant === 'danger' && { backgroundColor: 'transparent' },
        inactive && { opacity: 0.5 },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : colors.forest} />
      ) : (
        <Text
          style={[
            s.btnLabel,
            variant === 'primary' && { color: colors.white },
            variant === 'secondary' && { color: colors.forest },
            variant === 'danger' && { color: colors.danger },
          ]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

/** 선택 가능한 알약 모양 칩. 분류 고르기와 필터에 쓴다 */
export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        s.chip,
        selected
          ? { backgroundColor: colors.forest, borderColor: colors.forest }
          : { backgroundColor: pressed ? colors.surfaceMuted : colors.surface },
      ]}>
      <Text style={[s.chipLabel, selected && { color: colors.white, fontWeight: '600' }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

/** 목록이 비었을 때. 명세서 단계 3 "빈 상태 처리" */
export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <View style={s.empty}>
      <Text style={s.emptyTitle}>{title}</Text>
      {body ? <Text style={s.emptyBody}>{body}</Text> : null}
    </View>
  );
}

/** 오류를 삼키지 않고 사용자에게 보여 준다 */
export function ErrorNotice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={s.error}>
      <Text style={s.errorText}>{message}</Text>
      {onRetry ? <Button label="다시 시도" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

export function Loading({ label }: { label?: string }) {
  return (
    <View style={s.loading}>
      <ActivityIndicator color={colors.forest} />
      {label ? <Text style={s.loadingLabel}>{label}</Text> : null}
    </View>
  );
}

export function ScreenTitle({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[s.screenTitle, style]}>{children}</Text>;
}

const s = StyleSheet.create({
  btn: {
    minHeight: touchMin,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLabel: { fontSize: fontSize.body, fontWeight: '600' },
  chip: {
    minHeight: 38,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipLabel: { fontSize: fontSize.caption + 1, color: colors.text },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  empty: { padding: spacing.xxl, alignItems: 'center', gap: spacing.sm },
  emptyTitle: { fontSize: fontSize.body, color: colors.textMuted, fontWeight: '600' },
  emptyBody: { fontSize: fontSize.caption, color: colors.textFaint, textAlign: 'center', lineHeight: 20 },
  error: {
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: '#F6E3DE',
    gap: spacing.md,
  },
  errorText: { color: colors.danger, fontSize: fontSize.caption + 1, lineHeight: 20 },
  loading: { padding: spacing.xxl, alignItems: 'center', gap: spacing.md },
  loadingLabel: { color: colors.textMuted, fontSize: fontSize.caption },
  screenTitle: {
    fontSize: fontSize.heading,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(42, 38, 34, 0.45)',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.md,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  dialogTitle: { fontSize: fontSize.title, fontWeight: '700', color: colors.text },
  dialogBody: { fontSize: fontSize.body, color: colors.textMuted, lineHeight: 24 },
  dialogButtons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
});

/**
 * 확인 창.
 *
 * react-native 의 Alert.alert 은 웹에서 아무 일도 하지 않는다.
 * 웹도 배포 대상이므로(명세서 9장) 삭제 확인은 반드시 이 컴포넌트를 쓴다.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = '삭제',
  onConfirm,
  onCancel,
  destructive = true,
}: {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={s.backdrop} onPress={onCancel} accessibilityLabel="닫기">
        <Pressable style={s.dialog} onPress={(e) => e.stopPropagation()}>
          <Text style={s.dialogTitle}>{title}</Text>
          {message ? <Text style={s.dialogBody}>{message}</Text> : null}
          <View style={s.dialogButtons}>
            <Button label="취소" variant="secondary" onPress={onCancel} style={{ flex: 1 }} />
            <Button
              label={confirmLabel}
              variant={destructive ? 'danger' : 'primary'}
              onPress={onConfirm}
              style={[
                { flex: 1 },
                destructive && { borderWidth: 1, borderColor: colors.danger },
              ]}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
