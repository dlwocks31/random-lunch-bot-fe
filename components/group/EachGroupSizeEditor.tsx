import { TextField } from "@mui/material";

export function EachGroupSizeEditor({
  eachGroupSize,
  setEachGroupSize,
}: {
  eachGroupSize: number;
  setEachGroupSize: (eachGroupSize: number) => void;
}) {
  return (
    <div>
      <TextField
        label="원하는 조별 인원 수"
        type="number"
        value={eachGroupSize}
        onChange={(e) => {
          if (e.target.value) setEachGroupSize(Number(e.target.value));
        }}
      />
    </div>
  );
}
