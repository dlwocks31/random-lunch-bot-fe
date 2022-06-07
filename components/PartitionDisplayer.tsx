import { Chip } from "@mui/material";
import { SlackUser } from "../utils/slack/slack-user";

export function PartitionDisplayer({
  partition,
}: {
  partition: SlackUser[][];
}) {
  const officeGroupCount = 100; // TODO
  return (
    <div>
      <div>Partition Displayer</div>
      {partition.map((users, i) => (
        <div className="group-container" key={users.map((u) => u.id).join("-")}>
          <div>
            <div>
              Group {i + 1} ({users.length}명) (
              {i < officeGroupCount ? "사무실" : "재택"})
            </div>
          </div>
          {users.map((u) => (
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
        }
      `}</style>
    </div>
  );
}
