import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Card, ConfirmDialog } from '@/components/ui';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

/**
 * 계정 탭 (명세서 5장)
 *
 * 로그인·로그아웃·알림·개인 설정 자리다.
 * 알림 설정은 단계 3 에서 붙는다.
 */
export default function AccountScreen() {
  const { session, signOut } = useAuth();
  const [confirming, setConfirming] = useState(false);

  const email = session?.user.email ?? '(알 수 없음)';

  return (
    <ScrollView contentContainerStyle={s.body}>
      <Card>
        <Text style={s.label}>로그인한 계정</Text>
        <Text style={s.value}>{email}</Text>
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
});
