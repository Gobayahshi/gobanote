/**
 * 로그인 상태를 앱 전체가 공유한다.
 *
 * 세션은 Supabase 가 저장소에 넣어 두므로, 앱을 껐다 켜도 로그인이 유지된다.
 * 처음 한 번 세션을 읽어 오는 동안에는 loading 이 true 다. 이때 화면을 전환하면
 * 로그인한 사용자가 로그인 화면을 잠깐 보게 되므로, 반드시 loading 을 기다린다.
 */
import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from './supabase';

const REMEMBER_LOGIN_KEY = 'gobanote.remember-login';

export async function setRememberLogin(value: boolean): Promise<void> {
  await AsyncStorage.setItem(REMEMBER_LOGIN_KEY, value ? 'true' : 'false');
}

async function shouldRememberLogin(): Promise<boolean> {
  return (await AsyncStorage.getItem(REMEMBER_LOGIN_KEY)) !== 'false';
}

type AuthValue = {
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue>({
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    shouldRememberLogin()
      .then(async (rememberLogin) => {
        if (!rememberLogin) {
          await supabase.auth.signOut();
          return { data: { session: null } };
        }
        return supabase.auth.getSession();
      })
      .then(({ data }) => {
        if (!alive) return;
        setSession(data.session);
      })
      .catch(() => {
        // 네트워크가 끊겨 있어도 로그인 화면까지는 가야 한다
        if (alive) setSession(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      session,
      loading,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
