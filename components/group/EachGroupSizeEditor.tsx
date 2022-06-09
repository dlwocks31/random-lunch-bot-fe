import { Button } from "@mui/material";

export function EachGroupSizeEditor({
  setEachGroupSize,
}: {
  setEachGroupSize: (eachGroupSize: number) => void;
}) {
  return (
    <div className="root">
      <div>원하는 조별 인원 수:</div>
      <Button variant="contained" onClick={() => setEachGroupSize(3)}>
        3명
      </Button>
      <Button variant="contained" onClick={() => setEachGroupSize(4)}>
        4명
      </Button>
      <Button variant="contained" onClick={() => setEachGroupSize(5)}>
        5명
      </Button>
      <Button variant="contained" onClick={() => setEachGroupSize(6)}>
        6명
      </Button>
      <style jsx>{`
        .root {
          display: flex;
          align-items: center;
          gap: 5px;
        }
      `}</style>
    </div>
  );
}
