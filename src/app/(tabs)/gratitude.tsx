import { ComingSoon } from '@/components/coming-soon';

export default function GratitudeScreen() {
  return (
    <ComingSoon
      stage="단계 2에서 추가"
      title="감사"
      body={
        '감사 달력과 감사 노트를 모아 보는 화면입니다.\n\n' +
        '감사를 고르면 제목이 "YYMMDD 감사"로 채워지고, 네 가지 질문이 본문에 들어갑니다.\n\n' +
        '지금도 쓰기 탭에서 감사 분류로 저장하실 수 있고, 저장한 노트는 노트 탭의 감사 필터에 ' +
        '그대로 남습니다.'
      }
    />
  );
}
