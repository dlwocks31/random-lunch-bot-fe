import { Button } from "@mui/material";

export const MainGroupComopnent = ({
  onStepIncrement,
}: {
  onStepIncrement: () => void;
}) => {
  return (
    <div>
      <div>먼저, 슬랙에서 가져온 조원을 설정해 주세요.</div>
      <div>
        <div>사무실 - 총 60명 / 15조</div>
        <div>
          <div>조별 인원 수: 3명 / 4명 / 5명 / 6명</div>
          <div>조 개수: (-) 15개 (+)</div>
          <div>사무실 인원 추가: 드롭다운</div>
          <div>1조: ...</div>
        </div>
      </div>
      <div>
        <div>재택 - 총 11명 / 3조</div>
        <div>
          <div>조별 인원 수: 3명 / 4명 / 5명 / 6명</div>
          <div>조 개수: (-) 15개 (+)</div>
          <div>재택 인원 추가: 드롭다운</div>
          <div>1조: ...</div>
        </div>
      </div>
      <div>
        <div>불참 - 총 3명</div>
        <div>불참 인원: ....</div>
      </div>
      <div>
        <div>부가 설정</div>
        <div>
          <div>유저 가져오는 채널:</div>
          <div>전체에서 가져오기</div>
        </div>
        <div>
          <div>flex 연동</div>
          <div>계정: ...</div>
        </div>
        <div>
          <div>같은 조 피하기 설정</div>
          <div>더 자세히 설정:</div>
        </div>
      </div>
      <Button variant="contained" onClick={onStepIncrement}>
        다음 단계로
      </Button>
    </div>
  );
};
