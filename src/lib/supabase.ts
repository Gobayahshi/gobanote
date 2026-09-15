/**
 * Supabase 클라이언트 한 개를 앱 전체가 공유한다.
 *
 * 여기서 쓰는 값은 anon key 뿐이다. RLS 가 켜져 있어 각자 자기 노트만 읽고 쓴다.
 * service role key 나 Gemini 키는 앱에 절대 넣지 않는다. (명세서 2장·3장)
 */
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * 설정이 비어 있어도 앱이 흰 화면으로 죽지 않게 한다.
 * 로그인 화면에서 "환경 설정이 필요합니다" 안내를 대신 보여 준다.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured && __DEV__) {
  console.warn(
    '[고바노트] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY 가 없습니다. ' +
      '.env.example 을 .env 로 복사하고 값을 채운 뒤 개발 서버를 다시 시작하세요.',
  );
}

export const supabase = createClient(url ?? 'http://localhost', anonKey ?? 'anon', {
  auth: {
    // 웹에서는 브라우저 저장소를 쓰고, 폰에서는 AsyncStorage 를 쓴다.
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // 웹은 이메일 확인 링크가 URL 로 돌아오므로 켜고, 폰은 끈다.
    detectSessionInUrl: Platform.OS === 'web',
  },
});
