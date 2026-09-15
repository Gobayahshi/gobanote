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
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ErrorNotice } from '@/components/ui';
import { colors, fontSize, radius, spacing, touchMin } from '@/constants/theme';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

type Mode = 'signin' | 'signup';

export default function LoginScreen() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setNotice(null);

    if (!email.trim() || !password) {
      setError('이메일과 비밀번호를 입력해 주세요.');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        // 성공하면 AuthGate 가 알아서 탭 화면으로 보낸다
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;

        // 프로젝트 설정에 따라 이메일 확인이 필요할 수 있다
        if (!data.session) {
          setNotice('가입 확인 메일을 보냈습니다. 메일의 링크를 누른 뒤 로그인해 주세요.');
          setMode('signin');
        }
      }
    } catch (e) {
      setError(readableAuthError(e));
    } finally {
      setBusy(false);
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <SafeAreaView style={s.screen}>
        <View style={s.center}>
          <Text style={s.brand}>고바노트</Text>
          <ErrorNotice
            message={
              '서버 연결 설정이 없습니다.\n\n' +
              '.env.example 을 .env 로 복사하고 EXPO_PUBLIC_SUPABASE_URL 과 ' +
              'EXPO_PUBLIC_SUPABASE_ANON_KEY 를 채운 뒤 개발 서버를 다시 시작해 주세요.'
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.center} keyboardShouldPersistTaps="handled">
          <Text style={s.brand}>고바노트</Text>
          <Text style={s.tagline}>
            빈 칸에 적으면{'\n'}필요한 기능만 조용히 열립니다
          </Text>

          <View style={s.form}>
            <Text style={s.label}>이메일</Text>
            <TextInput
              style={s.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              placeholder="you@example.com"
              placeholderTextColor={colors.textFaint}
              editable={!busy}
            />

            <Text style={s.label}>비밀번호</Text>
            <TextInput
              style={s.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              textContentType={mode === 'signup' ? 'newPassword' : 'password'}
              placeholder={mode === 'signup' ? '6자 이상' : ''}
              placeholderTextColor={colors.textFaint}
              editable={!busy}
              onSubmitEditing={submit}
              returnKeyType="go"
            />

            {notice ? <Text style={s.notice}>{notice}</Text> : null}
            {error ? <Text style={s.error}>{error}</Text> : null}

            <Button
              label={mode === 'signin' ? '로그인' : '가입하기'}
              onPress={submit}
              loading={busy}
              style={{ marginTop: spacing.sm }}
            />

            <Button
              label={mode === 'signin' ? '계정이 없으신가요? 가입하기' : '이미 계정이 있어요'}
              variant="secondary"
              onPress={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError(null);
                setNotice(null);
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Supabase 의 영어 오류 메시지를 그대로 보여 주지 않는다 */
function readableAuthError(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e);

  if (/invalid login credentials/i.test(raw)) return '이메일 또는 비밀번호가 맞지 않습니다.';
  if (/email not confirmed/i.test(raw)) return '가입 확인 메일의 링크를 먼저 눌러 주세요.';
  if (/user already registered/i.test(raw)) return '이미 가입된 이메일입니다. 로그인해 주세요.';
  if (/password should be at least/i.test(raw)) return '비밀번호는 6자 이상이어야 합니다.';
  if (/unable to validate email|invalid format/i.test(raw)) return '이메일 형식을 확인해 주세요.';
  if (/network|fetch failed/i.test(raw)) return '서버에 연결하지 못했습니다. 잠시 뒤 다시 시도해 주세요.';

  return `로그인에 실패했습니다.\n(${raw})`;
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
