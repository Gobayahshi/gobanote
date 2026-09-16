import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, Card, ConfirmDialog } from '@/components/ui';
import { colors, fontSize, radius, spacing, touchMin } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

/**
 * 계정 탭 (명세서 5장)
 *
 * 로그인·로그아웃·알림·개인 설정 자리다.
 * 알림 설정은 단계 3 에서 붙는다.
 */
export default function AccountScreen() {
  const { session, signOut } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const email = session?.user.email ?? '(알 수 없음)';

  async function handleChangePassword() {
    setError(null);
    setNotice(null);

    if (newPassword.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNotice('비밀번호가 변경되었습니다.');
      setNewPassword('');
      setNewPasswordConfirm('');
    } catch (e) {
      setError(e instanceof Error ? e.message : '비밀번호를 변경하지 못했습니다.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={s.body}>
      <Card>
        <Text style={s.label}>로그인한 계정</Text>
        <Text style={s.value}>{email}</Text>
      </Card>

      <Card>
        <Text style={s.label}>비밀번호 변경</Text>
        <Text style={s.body2}>새 비밀번호를 입력하고 저장하면 바로 변경됩니다.</Text>

        <TextInput
          style={s.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="새 비밀번호"
          placeholderTextColor={colors.textFaint}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          editable={!busy}
        />

        <TextInput
          style={s.input}
          value={newPasswordConfirm}
          onChangeText={setNewPasswordConfirm}
          placeholder="비밀번호 확인"
          placeholderTextColor={colors.textFaint}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          editable={!busy}
          onSubmitEditing={handleChangePassword}
          returnKeyType="done"
        />

        {error ? <Text style={s.error}>{error}</Text> : null}
        {notice ? <Text style={s.notice}>{notice}</Text> : null}

        <Button
          label={busy ? '변경 중...' : '비밀번호 변경'}
          onPress={handleChangePassword}
          loading={busy}
          style={{ marginTop: spacing.sm }}
        />
      </Card>

      <Card>
        <Text style={s.label}>내 노트만 보입니다</Text>
        <Text style={s.body2}>
          노트는 계정별로 분리되어 있습니다. 같은 주소로 접속하더라도 다른 사람이 내 노트를 볼 수
          없고, 나도 다른 사람의 노트를 볼 수 없습니다.
        </Text>
      </Card>

      <Card>
        <Text style={s.label}>아직 준비 중</Text>
        <Text style={s.body2}>
          기한 알림 설정은 단계 3 에서 추가됩니다. 웹에서는 브라우저 제약이 있어 챙김 탭에서
          확인하는 방식으로 대신합니다.
        </Text>
      </Card>

      <Button label="로그아웃" variant="secondary" onPress={() => setConfirming(true)} />

      <ConfirmDialog
        visible={confirming}
        title="로그아웃할까요?"
        message="노트는 서버에 그대로 남아 있습니다. 다시 로그인하면 그대로 보입니다."
        confirmLabel="로그아웃"
        destructive={false}
        onConfirm={() => {
          setConfirming(false);
          void signOut();
        }}
        onCancel={() => setConfirming(false)}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  body: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  label: { fontSize: fontSize.caption, fontWeight: '600', color: colors.textMuted },
  value: { fontSize: fontSize.body, color: colors.text, marginTop: spacing.xs },
  body2: {
    fontSize: fontSize.caption + 1,
    color: colors.textMuted,
    lineHeight: 21,
    marginTop: spacing.xs,
  },
  input: {
    minHeight: touchMin + 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.body,
    color: colors.text,
    marginTop: spacing.sm,
  },
  error: { color: colors.danger, fontSize: fontSize.caption, lineHeight: 20, marginTop: spacing.sm },
  notice: { color: colors.forest, fontSize: fontSize.caption, lineHeight: 20, marginTop: spacing.sm },
});
