import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ErrorNotice } from '@/components/ui';
import { colors, fontSize, radius, spacing, touchMin } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const recoveryDetected = useMemo(() => {
    if (typeof window === 'undefined') return false;

    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const type = params.get('type') ?? hash.get('type');
    const token = params.get('token') ?? hash.get('token');
    const accessToken = params.get('access_token') ?? hash.get('access_token');
    const refreshToken = params.get('refresh_token') ?? hash.get('refresh_token');

    return type === 'recovery' || Boolean(token || (accessToken && refreshToken));
  }, []);

  useEffect(() => {
    if (!recoveryDetected && !session) {
      setError('유효한 비밀번호 재설정 링크가 아닙니다. 메일 링크를 다시 확인해 주세요.');
      return;
    }

    setReady(true);
  }, [recoveryDetected, session]);

  async function submit() {
    if (!session) {
      setError('로그인 상태를 확인할 수 없습니다. 메일 링크를 다시 클릭해 주세요.');
      return;
    }

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    if (password !== confirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setMessage('비밀번호가 변경되었습니다. 로그인 화면으로 이동합니다.');
      setTimeout(() => {
        router.replace('/login');
      }, 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : '비밀번호를 변경하지 못했습니다.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={s.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.center} keyboardShouldPersistTaps="handled">
          <Text style={s.brand}>비밀번호 재설정</Text>
          <Text style={s.tagline}>새 비밀번호를 입력하고 계정을 다시 활성화해 주세요.</Text>

          {!ready && !session ? (
            <ErrorNotice message="유효한 재설정 링크가 아닙니다." />
          ) : (
            <View style={s.form}>
              <Text style={s.label}>새 비밀번호</Text>
              <TextInput
                style={s.input}
                value={password}
                onChangeText={setPassword}
                placeholder="6자 이상"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!busy}
              />

              <Text style={s.label}>비밀번호 확인</Text>
              <TextInput
                style={s.input}
                value={confirm}
                onChangeText={setConfirm}
                placeholder="다시 입력"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!busy}
                onSubmitEditing={submit}
                returnKeyType="done"
              />

              {message ? <Text style={s.notice}>{message}</Text> : null}
              {error ? <Text style={s.error}>{error}</Text> : null}

              <Button
                label={busy ? '변경 중...' : '비밀번호 변경'}
                onPress={submit}
                loading={busy}
                style={{ marginTop: spacing.sm }}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  brand: { fontSize: 34, fontWeight: '700', color: colors.forest, textAlign: 'center' },
  tagline: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  form: { gap: spacing.sm },
  label: { fontSize: fontSize.caption, color: colors.textMuted, marginTop: spacing.sm },
  input: {
    minHeight: touchMin + 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.body,
    color: colors.text,
  },
  notice: { color: colors.forest, fontSize: fontSize.caption, lineHeight: 20 },
  error: { color: colors.danger, fontSize: fontSize.caption, lineHeight: 20 },
});
