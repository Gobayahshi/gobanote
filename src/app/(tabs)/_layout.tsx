import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { colors, fontSize } from '@/constants/theme';

/**
 * 하단 탭 여섯 개 (명세서 5장)
 *
 *   쓰기 · 노트 · 검색 · 감사 · 챙김 · 계정
 *
 * 명세서는 "모든 탭을 한 화면에 길게 쌓지 않는다"고 못박고 있다.
 * 탭을 줄이거나 합치지 않는다.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerShadowVisible: false,
        headerTitleStyle: { color: colors.text, fontWeight: '600' },
        tabBarActiveTintColor: colors.forest,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        // 탭이 여섯 개라 한글 라벨이 잘리지 않도록 조금 줄인다
        tabBarLabelStyle: { fontSize: fontSize.caption - 2 },
        sceneStyle: { backgroundColor: colors.bg },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '쓰기',
          tabBarIcon: ({ color, size }) => <Ionicons name="create-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: '노트',
          tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: '검색',
          tabBarIcon: ({ color, size }) => <Ionicons name="search-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="gratitude"
        options={{
          title: '감사',
          tabBarIcon: ({ color, size }) => <Ionicons name="sunny-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="care"
        options={{
          title: '챙김',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-circle-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: '계정',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
