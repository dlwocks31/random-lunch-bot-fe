import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { IconButton } from "@mui/material";

export const StepInput = ({
  count,
  setCount,
}: {
  count: number;
  setCount: (count: number) => void;
}) => {
  return (
    <div className="root">
      <div className="edit-root">
        <IconButton onClick={() => setCount(count - 1)} size="small">
          <RemoveIcon />
        </IconButton>
        <div>{count}</div>
        <IconButton onClick={() => setCount(count + 1)} size="small">
          <AddIcon />
        </IconButton>
      </div>

      <style jsx>{`
        .edit-root {
          display: flex;
          align-items: center;
          gap: 5px;
          border: 1px solid #1976d2;
          border-radius: 5px;
        }
        .root {
          display: flex;
          gap: 10px;
          align-items: center;
          margin: 5px 0;
        }
      `}</style>
    </div>
  );
};
