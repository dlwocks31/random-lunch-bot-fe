import { IconButton } from "@mui/material";
import { SlackUser } from "../../utils/slack/slack-user";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { getStandardPartitionConfig } from "../../utils/group/GetStandardPartitionConfig";
export function GroupCountEditor({
  groupCount,
  users,
  groupTypeLabel = "",
  setGroupCount,
}: {
  groupCount: number;
  users: SlackUser[];
  groupTypeLabel: string;
  setGroupCount: (groupCount: number) => void;
}) {
  const max = (a: number, b: number) => (a > b ? a : b);
  const min = (a: number, b: number) => (a < b ? a : b);
  const incrementGroupCount = () => {
    setGroupCount(min(groupCount + 1, users.length));
  };
  const decrementGroupCount = () => {
    setGroupCount(max(groupCount - 1, 1));
  };
  const standardPartitionConfig = getStandardPartitionConfig(
    users.length,
    groupCount,
  );
  const standardPartitionLabel = standardPartitionConfig
    .map((c) => `${c.groupSize}인조 * ${c.groupCount}개`)
    .join(" + ");
  if (users.length === 0) {
    return null;
  }
  return (
    <div className="root">
      <div className="label-root">
        <div className="numbers">{groupTypeLabel}</div>
        <div>에서 참석하는</div>
        <div className="numbers">{users?.length}</div>
        <div>명의 유저 조 개수:</div>
      </div>
      <div className="edit-root">
        <IconButton onClick={decrementGroupCount} size="small">
          <RemoveIcon />
        </IconButton>
        <div>{groupCount}</div>
        <IconButton onClick={incrementGroupCount} size="small">
          <AddIcon />
        </IconButton>
      </div>
      <div>({standardPartitionLabel})</div>

      <style jsx>{`
        .label-root {
          display: flex;
          align-items: center;
          font-size: 1rem;
        }
        .edit-root {
          display: flex;
          align-items: center;
          gap: 5px;
          border: 1px solid #1976d2;
          border-radius: 5px;
        }
        .numbers {
          padding: 3px;
          text-decoration: underline;
        }
        .button {
          font-weight: bold;
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
}
