import { ComingSoon } from '@/components/coming-soon';

export default function SearchScreen() {
  return (
    <ComingSoon
      stage="단계 3에서 추가"
      title="검색"
      body={
        '제목·본문·주제·태그로 지난 노트를 찾는 화면입니다.\n\n' +
        '지금은 노트 탭의 분류 필터로 찾아보실 수 있습니다.'
      }
    />
  );
}
