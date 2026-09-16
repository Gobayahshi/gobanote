import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Loading } from '@/components/ui';
import { colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/lib/auth';

/**
 * 로그인 여부에 따라 화면을 가른다.
 *
 * loading 이 끝나기 전에는 아무 곳으로도 보내지 않는다.
 * 세션을 저장소에서 읽어 오는 짧은 순간에 로그인 화면이 번쩍이는 걸 막는다.
 */
function isRecoveryRedirect() {
  if (typeof window === 'undefined') return false;

  const search = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

  return (
    search.get('type') === 'recovery' ||
    hashParams.get('type') === 'recovery' ||
    Boolean(search.get('access_token') || hashParams.get('access_token'))
  );
}

function AuthGate() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const recovery = isRecoveryRedirect();
    if (recovery && segments[0] !== 'reset-password') {
      router.replace('/reset-password');
      return;
    }

    const inApp =
      segments[0] === '(tabs)' || segments[0] === 'note' || segments[0] === 'reset-password';

    if (!session && inApp && segments[0] !== 'reset-password') {
      router.replace('/login');
    } else if (session && segments[0] === 'login') {
      router.replace('/');
    }
  }, [session, loading, segments, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}>
        <Loading />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.forest,
        headerTitleStyle: { color: colors.text, fontWeight: '600' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="reset-password" options={{ title: '비밀번호 재설정' }} />
      <Stack.Screen name="note/[id]" options={{ title: '노트' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <AuthGate />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
