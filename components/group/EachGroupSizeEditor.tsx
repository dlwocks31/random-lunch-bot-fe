import { ToggleButton, ToggleButtonGroup } from "@mui/material";

export function EachGroupSizeEditor({
  eachGroupSize,
  setEachGroupSize,
}: {
  eachGroupSize: number;
  setEachGroupSize: (eachGroupSize: number) => void;
}) {
  const handleChange = (
    _: React.MouseEvent<HTMLElement>,
    newGroupSize: number | null,
  ) => {
    if (newGroupSize) {
      setEachGroupSize(newGroupSize);
    }
  };
  return (
    <div className="root">
      <ToggleButtonGroup
        value={eachGroupSize}
        exclusive
        onChange={handleChange}
        size="small"
      >
        {[3, 4, 5, 6].map((size) => (
          <ToggleButton key={size} value={size}>
            <div className="inside-toggle">{size}명</div>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <style jsx>{`
        .root {
          display: flex;
          align-items: flex-start;
          gap: 5px;
        }
        .inside-toggle {
          padding: 0 10px;
          font-weight: bold;
          font-size: 1rem;
        }
        .toggle-button {
          padding: 0;
        }
      `}</style>
    </div>
  );
}
