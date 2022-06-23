import { ceil, concat, groupBy } from "lodash";
import { useEffect, useState } from "react";
import { SlackUser } from "../utils/slack/slack-user";
import { FlexUserFetcher } from "./fetch/FlexUserFetcher";
import { EachGroupSizeEditor } from "./group/EachGroupSizeEditor";
import { UserGroupTypeSelector } from "./group/UserGroupSelector";
import { TagEditor } from "./tag/TagEditor";
import { GroupType } from "../utils/domain/GroupType";
import { HelpIconWithTooltip } from "./util/HelpIconWithTooltip";
import { PartitionConfig } from "../utils/domain/PartitionConfig";
import { getGroupTypeHeuristics } from "../utils/slack/GetGroupTypeHeuristics";
import { GroupCountEditor } from "./group/GroupCountEditor";
import { appendFile } from "fs";

export function PartitionConfigBuilder({
  initialUsers,
  partitionConfig,
  setPartitionConfig,
}: {
  initialUsers: SlackUser[];
  partitionConfig: PartitionConfig;
  setPartitionConfig: (
    transition: (partitionConfig: PartitionConfig) => PartitionConfig,
  ) => void;
}) {
  const [eachGroupSize, setEachGroupSize] = useState(4);

  const getGroupedUserV2 = (users: SlackUser[]) => {
    return groupBy(users, (user: SlackUser) => {
      return user.statusEmoji === ":palm_tree:" ||
        user.statusMessage.includes("휴직")
        ? GroupType.EXCLUDED
        : user.statusEmoji === ":house_with_garden:"
        ? GroupType.REMOTE
        : GroupType.OFFICE;
    });
  };
  const groupedUserV2 = getGroupedUserV2(initialUsers);
  useEffect(() => {
    const groupedUser = groupBy(initialUsers, (user) =>
      getGroupTypeHeuristics(user),
    );
    setPartitionConfig((partitionConfig) => {
      return {
        ...partitionConfig,
        officeUsers: groupedUser[GroupType.OFFICE] || [],
        remoteUsers: groupedUser[GroupType.REMOTE] || [],
        excludedUsers: groupedUser[GroupType.EXCLUDED] || [],
      };
    });
  }, [initialUsers]);

  useEffect(() => {
    const officeGroupCount = ceil(
      partitionConfig.officeUsers.length / eachGroupSize,
    );
    setPartitionConfig((config) => ({
      ...config,
      officeGroupCount,
    }));
  }, [partitionConfig.officeUsers, eachGroupSize]);

  useEffect(() => {
    const remoteGroupCount = ceil(
      partitionConfig.remoteUsers.length / eachGroupSize,
    );
    setPartitionConfig((config) => ({
      ...config,
      remoteGroupCount,
    }));
  }, [partitionConfig.remoteUsers, eachGroupSize]);

  console.log(`initialUsers: ${initialUsers.length}`);

  function addExcludedUser(userId: string) {
    setExcludedUserIf((u) => u.id === userId);
  }

  function addRemoteUser(userId: string) {
    setRemoteUserIf((u) => u.id === userId);
  }

  function addOfficeUser(userId: string) {
    setOfficeUserIf((u) => u.id === userId);
  }
  function addRemoteUsersByEmail(emails: string[]) {
    console.log(`addRemoteUsersByEmail: ${emails}`);
    setRemoteUserIf((u) => emails.includes(u.email));
  }

  function addExcludedUsersByEmail(emails: string[]) {
    setExcludedUserIf((u) => emails.includes(u.email));
  }

  function setOfficeUserIf(predicate: (u: SlackUser) => boolean) {
    setPartitionConfig((partitionConfig) => {
      const remoteUsers = partitionConfig.remoteUsers.filter(
        (u) => !predicate(u),
      );
      const excludedUsers = partitionConfig.excludedUsers.filter(
        (u) => !predicate(u),
      );
      const officeUsers = concat(
        partitionConfig.officeUsers,
        partitionConfig.remoteUsers.filter(predicate),
        partitionConfig.excludedUsers.filter(predicate),
      );
      return {
        ...partitionConfig,
        officeUsers,
        remoteUsers,
        excludedUsers,
      };
    });
  }

  function setRemoteUserIf(predicate: (u: SlackUser) => boolean) {
    setPartitionConfig((partitionConfig) => {
      const officeUsers = partitionConfig.officeUsers.filter(
        (u) => !predicate(u),
      );
      const excludedUsers = partitionConfig.excludedUsers.filter(
        (u) => !predicate(u),
      );
      const remoteUsers = concat(
        partitionConfig.remoteUsers,
        partitionConfig.officeUsers.filter(predicate),
        partitionConfig.excludedUsers.filter(predicate),
      );
      return {
        ...partitionConfig,
        officeUsers,
        remoteUsers,
        excludedUsers,
      };
    });
  }

  function setExcludedUserIf(predicate: (u: SlackUser) => boolean) {
    setPartitionConfig((partitionConfig) => {
      const officeUsers = partitionConfig.officeUsers.filter(
        (u) => !predicate(u),
      );
      const remoteUsers = partitionConfig.remoteUsers.filter(
        (u) => !predicate(u),
      );
      const excludedUsers = concat(
        partitionConfig.excludedUsers,
        partitionConfig.officeUsers.filter(predicate),
        partitionConfig.remoteUsers.filter(predicate),
      );
      return {
        ...partitionConfig,
        officeUsers,
        remoteUsers,
        excludedUsers,
      };
    });
  }

  return (
    <div className="config-root">
      <div>
        <h3 className="title">조별 인원 수</h3>
        <EachGroupSizeEditor
          eachGroupSize={eachGroupSize}
          setEachGroupSize={setEachGroupSize}
        />
        <GroupCountEditor
          groupCount={partitionConfig.officeGroupCount}
          usersCount={partitionConfig.officeUsers.length}
          groupTypeLabel="사무실"
          setGroupCount={(officeGroupCount: number) =>
            setPartitionConfig((config) => ({
              ...config,
              officeGroupCount,
            }))
          }
        />
        <GroupCountEditor
          groupCount={partitionConfig.remoteGroupCount}
          usersCount={partitionConfig.remoteUsers.length}
          groupTypeLabel="재택"
          setGroupCount={(remoteGroupCount: number) =>
            setPartitionConfig((config) => ({
              ...config,
              remoteGroupCount,
            }))
          }
        />
      </div>
      <div>
        <h3 className="title">그룹 설정</h3>
        <UserGroupTypeSelector
          allUsers={initialUsers}
          includedUsers={partitionConfig.officeUsers}
          groupTypeLabel="사무실"
          addGroupUser={addOfficeUser}
        />
        <UserGroupTypeSelector
          allUsers={initialUsers}
          includedUsers={partitionConfig.remoteUsers}
          groupTypeLabel="재택"
          addGroupUser={addRemoteUser}
        />
        <UserGroupTypeSelector
          allUsers={initialUsers}
          includedUsers={partitionConfig.excludedUsers}
          groupTypeLabel="불참"
          addGroupUser={addExcludedUser}
        />
      </div>
      <div>
        <div className="iconed-header">
          <h3 className="title">태그 설정</h3>
          <HelpIconWithTooltip title="같은 태그에 속해있는 유저들은 가능한 한 같은 조에 속하지 않게 됩니다." />
        </div>
        <TagEditor
          users={initialUsers}
          tagMap={partitionConfig.tagToUserIdsMap}
          onTagMapChange={(tagMap) =>
            setPartitionConfig((config) => ({
              ...config,
              tagToUserIdsMap: tagMap,
            }))
          }
        />
      </div>
      <div>
        <div className="iconed-header">
          <h3 className="title">플렉스 연동</h3>
          <HelpIconWithTooltip title="플렉스에서 휴가자, 재택자 정보를 가져올 수 있습니다." />
        </div>
        <FlexUserFetcher
          hasUser={initialUsers.length > 0}
          addRemoteUsersByEmail={addRemoteUsersByEmail}
          addUnselectedUsersByEmail={addExcludedUsersByEmail}
        />
      </div>
      <div>
        <h3 className="title">슬랙 상태 이모지 기준으로 확인</h3>
        <div>
          🏡 = 재택 , 🌴 = 휴가 기준으로 확인할 수 있습니다. 실제 조에 포함되어
          있지 않으면 볼드체로 표현됩니다.
        </div>
        <div>
          재택:{" "}
          {(groupedUserV2[GroupType.REMOTE] || [])
            .map<React.ReactNode>((a) => (
              <span
                key={a.id}
                className={
                  partitionConfig.remoteUsers.find((u) => u.id === a.id)
                    ? ""
                    : "bold-span"
                }
              >
                {a.displayName}
              </span>
            ))
            .reduce((prev, curr) => [prev, <span key={null}>, </span>, curr])}
        </div>
        <div>
          휴가:{" "}
          {(groupedUserV2[GroupType.EXCLUDED] || [])
            .map<React.ReactNode>((a) => (
              <span
                key={a.id}
                className={
                  partitionConfig.excludedUsers.find((u) => u.id === a.id)
                    ? ""
                    : "bold-span"
                }
              >
                {a.displayName}
              </span>
            ))
            .reduce((prev, curr) => [prev, <span key={null}>, </span>, curr])}
        </div>
      </div>
      <style jsx>{`
        .config-root {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .iconed-header {
          display: flex;
          align-items: center;
        }
        .title {
          margin: 5px 0;
        }
        .bold-span {
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}
