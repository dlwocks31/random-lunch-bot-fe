import { Chip } from "@mui/material";
import { GroupType } from "../utils/domain/GroupType";
import { Partition } from "../utils/domain/Partition";

export function PartitionDisplayer({ partition }: { partition: Partition }) {
  return (
    <div>
      <h3>조 추첨 예시 결과</h3>
      {partition.groups.map((group, i) => (
        <div
          className="group-container"
          key={group.users.map((u) => u.id).join("-")}
        >
          <div>
            <div>
              Group {i + 1} ({group.users.length}명) (
              {group.groupType === GroupType.OFFICE ? "사무실" : "재택"})
            </div>
          </div>
          {group.users.map((u) => (
            <div key={u.id}>
              <Chip label={u.displayName} />
            </div>
          ))}
        </div>
      ))}
      <style jsx>{`
        .group-container {
          display: flex;
          gap: 3px;
          align-items: center;
          padding: 2px 0;
        }
      `}</style>
    </div>
  );
}
