import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { Button, Chip, Collapse, IconButton, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import Select from "react-select";
import { MemberConfig } from "../../utils/domain/MemberConfig";
import { MemberPartition } from "../../utils/domain/MemberPartition";
import { TagMap } from "../../utils/domain/TagMap";
import { SlackUser } from "../../utils/slack/slack-user";
import { generateTags } from "../../utils/tag/GenerateTags";
import { EachGroupSizeEditor } from "../group/EachGroupSizeEditor";
import { CollapseContainer } from "../util/CollapseContainer";

export const MainGroupComopnent = ({
  onStepIncrement,
  members,
  setMembers,
}: {
  onStepIncrement: () => void;
  members: MemberConfig;
  setMembers: (members: MemberConfig) => void;
}) => {
  const allUsers = members.allUsers();
  const [tagMap, setTagMap] = useState<TagMap>(new TagMap([]));

  useEffect(() => {
    if (!tagMap.tags.length) {
      const newTagMap = new TagMap(generateTags(allUsers));
      setTagMap(newTagMap);
      setMembers(members.shuffleByTagMap(newTagMap));
    }
  }, [members.allUsers().length]); // 어떻게 더 잘 할 수 있을까..

  console.log("XXX remoteUser:");
  console.log(members.remote);
  return (
    <div>
      <div>먼저, 슬랙에서 가져온 조원을 설정해 주세요.</div>
      <div>
        <MemberPartitionComponent
          allUsers={allUsers}
          partition={members.office}
          groupTypeName="사무실"
          onAddGroupUser={(user) =>
            setMembers(members.moveMemberToOffice(user))
          }
          setPartition={(partition) =>
            setMembers(members.setOfficePartition(partition))
          }
        />
        <MemberPartitionComponent
          allUsers={allUsers}
          partition={members.remote}
          groupTypeName="재택"
          onAddGroupUser={(user) =>
            setMembers(members.moveMemberToRemote(user))
          }
          setPartition={(partition) =>
            setMembers(members.setRemotePartition(partition))
          }
        />
        <UsersListComponent
          users={members.excluded}
          groupTypeName="제외"
          allUsers={allUsers}
          onAddGroupUser={(user) =>
            setMembers(members.moveMemberToExcluded(user))
          }
        />
      </div>
      <Button variant="contained" onClick={onStepIncrement} fullWidth>
        다음 단계로 {">"}
      </Button>
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
          <div>
            <CustomTagEditor
              users={allUsers}
              tagMap={tagMap}
              setTagMap={setTagMap}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomGroupCountEditor = ({
  groupCount,
  setGroupCount,
}: {
  groupCount: number;
  setGroupCount: (groupCount: number) => void;
}) => {
  return (
    <div className="root">
      <div className="edit-root">
        <IconButton onClick={() => setGroupCount(groupCount - 1)} size="small">
          <RemoveIcon />
        </IconButton>
        <div>{groupCount}</div>
        <IconButton onClick={() => setGroupCount(groupCount + 1)} size="small">
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

const CustomUserGroupTypeSelector = ({
  allUsers,
  includedUsers,
  addGroupUser,
}: {
  allUsers: SlackUser[];
  includedUsers: SlackUser[];
  addGroupUser: (user: SlackUser) => void;
}) => {
  const unselectedUsers = allUsers.filter(
    (u) => !includedUsers.some((su) => su.id === u.id),
  );
  return (
    <div>
      <Select
        placeholder="유저 이름을 검색하세요"
        options={unselectedUsers.map(({ id, displayName }) => ({
          value: id,
          label: displayName,
        }))}
        value={null}
        onChange={(e) => {
          if (e) {
            const user = allUsers.find((u) => u.id === e.value);
            if (user) {
              addGroupUser(user);
            }
          }
        }}
      />
    </div>
  );
};

const MemberPartitionComponent = ({
  partition,
  allUsers,
  groupTypeName,
  onAddGroupUser,
  setPartition,
}: {
  partition: MemberPartition;
  allUsers: SlackUser[];
  groupTypeName: string;
  onAddGroupUser: (user: SlackUser) => void;
  setPartition: (partition: MemberPartition) => void;
}) => (
  <CollapseContainer
    title={`${groupTypeName} - 총 ${partition.userCount()}명 / ${partition.groupCount()}조`}
  >
    <div>
      <div>
        조별 최소 인원 수:{" "}
        <EachGroupSizeEditor
          eachGroupSize={partition.defaultGroupSize}
          setEachGroupSize={(eachGroupSize) => {
            console.log("eachGroupSize is ", eachGroupSize);
            setPartition(partition.changeDefaultGroupSize(eachGroupSize));
          }}
        />
      </div>
      <div>
        조 개수:
        <CustomGroupCountEditor
          groupCount={partition.groupCount()}
          setGroupCount={(groupCount) =>
            setPartition(partition.changeGroupCount(groupCount))
          }
        />
      </div>
      <div>
        {groupTypeName} 인원 추가:
        <CustomUserGroupTypeSelector
          allUsers={allUsers}
          includedUsers={partition.users()}
          addGroupUser={onAddGroupUser}
        />
      </div>
      <div>
        {partition.groups.map((group, i) => (
          <div key={i} className="group-container">
            <div>{i + 1}조:</div>
            {group.map((user) => (
              <Chip key={user.id} label={user.displayName} />
            ))}
          </div>
        ))}
      </div>
      <style jsx>{`
        .group-container {
          display: flex;
          gap: 3px;
          align-items: center;
          padding: 2px 0;
        }
      `}</style>
    </div>
  </CollapseContainer>
);

const UsersListComponent = ({
  users,
  allUsers,
  groupTypeName,
  onAddGroupUser,
}: {
  users: SlackUser[];
  allUsers: SlackUser[];
  groupTypeName: string;
  onAddGroupUser: (user: SlackUser) => void;
}) => (
  <CollapseContainer title={`${groupTypeName} - 총 ${users.length}명`}>
    <div>
      <div>
        {groupTypeName} 인원 추가:{" "}
        <CustomUserGroupTypeSelector
          allUsers={allUsers}
          includedUsers={users}
          addGroupUser={onAddGroupUser}
        />
      </div>
      <div>
        {users.map((user) => (
          <Chip key={user.id} label={user.displayName} />
        ))}
      </div>
    </div>
  </CollapseContainer>
);

const CustomTagEditor = ({
  users,
  tagMap,
  setTagMap,
}: {
  users: SlackUser[];
  tagMap: TagMap;
  setTagMap: (tagMap: TagMap) => void;
}) => {
  const [newTagName, setNewTagName] = useState("");
  const [isOpened, setIsOpened] = useState(false);
  return (
    <div className="root">
      <Button variant="outlined" onClick={() => setIsOpened((open) => !open)}>
        같은 조 피하기 설정 {isOpened ? "숨기기" : "보기"}
      </Button>
      <Collapse in={isOpened}>
        <div>
          <div>Tags: </div>
          {Object.entries(tagMap.tagToUserIdsMap()).map(([tag, userIds]) => (
            <div key={tag} className="each-tag-container">
              <Chip label={tag} />
              <Select
                isMulti
                options={users.map(({ id, displayName }) => ({
                  value: id,
                  label: displayName,
                }))}
                value={userIds.map((id) => {
                  const user = users.find((u) => u.id === id);
                  return {
                    value: id,
                    label: user?.displayName || "",
                  };
                })}
                onChange={(e) => {
                  const userIds = e.map((e) => e.value);
                  setTagMap(tagMap.setUserIdsOfTag(tag, userIds));
                }}
              />
            </div>
          ))}
        </div>
        <div className="new-tag-container">
          <div>태그 이름 추가하기:</div>
          <TextField
            label="태그 이름"
            size="small"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setTagMap(tagMap.setNewTag(newTagName));
                setNewTagName("");
              }
            }}
          />
        </div>
      </Collapse>
      <style jsx>{`
        .new-tag-container {
          display: flex;
        }
        .each-tag-container {
          display: flex;
          gap: 10px;
        }
        .tag-preview {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .root {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
      `}</style>
    </div>
  );
};
