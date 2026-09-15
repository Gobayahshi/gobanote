import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { NoteRow } from '@/components/note-row';
import { Chip, EmptyState, ErrorNotice, Loading } from '@/components/ui';
import { colors, spacing } from '@/constants/theme';
import { CATEGORIES, CATEGORY_INFO, type Category } from '@/lib/categories';
import { listNotes, type Note } from '@/lib/notes';

/**
 * 노트 목록 (명세서 5장 "노트 목록·상세")
 *
 * 필터: 전체 / 일상 / 할 일 / 기도 / 일기 / 감사 / 말씀
 * 정렬은 최신순. 오래된 노트를 찾기 쉬운 날짜순 목록이다.
 */
export default function NotesScreen() {
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (opts?: { refresh?: boolean }) => {
      if (opts?.refresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        setNotes(await listNotes(filter === 'all' ? undefined : filter));
      } catch (e) {
        setError(e instanceof Error ? e.message : '노트를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filter],
  );

  // 다른 탭에서 노트를 저장하고 돌아왔을 때 목록이 낡아 있으면 안 된다
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View style={s.screen}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filters}
        style={s.filterBar}>
        <Chip label="전체" selected={filter === 'all'} onPress={() => setFilter('all')} />
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={CATEGORY_INFO[c].label}
            selected={filter === c}
            onPress={() => setFilter(c)}
          />
        ))}
      </ScrollView>

      {error ? <ErrorNotice message={error} onRetry={() => load()} /> : null}

      {loading && notes.length === 0 ? (
        <Loading label="불러오는 중" />
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(n) => n.id}
          renderItem={({ item }) => <NoteRow note={item} />}
          contentContainerStyle={s.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load({ refresh: true })}
              tintColor={colors.forest}
            />
          }
          ListEmptyComponent={
            error ? null : (
              <EmptyState
                title={filter === 'all' ? '아직 노트가 없습니다' : '이 분류에는 노트가 없습니다'}
                body="쓰기 탭에서 빈 칸에 그냥 적어 보세요."
              />
            )
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  filterBar: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: colors.border },
  filters: { padding: spacing.md, gap: spacing.sm },
  list: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
});
