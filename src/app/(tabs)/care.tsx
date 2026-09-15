import { ComingSoon } from '@/components/coming-soon';

export default function CareScreen() {
  return (
    <ComingSoon
      stage="단계 2에서 추가"
      title="챙김"
      body={
        '아직 끝내지 않은 할 일만 모아 보고, 이 화면에서 바로 완료 처리하는 곳입니다.\n\n' +
        '지금은 노트 탭의 할 일 필터로 확인하실 수 있습니다.'
      }
    />
  );
}
