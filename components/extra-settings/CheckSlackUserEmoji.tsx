import { MemberConfig } from "../../utils/domain/MemberConfig";
import { NormalUser } from "../../utils/slack/NormalUser";

export const CheckSlackUserEmoji = ({ members }: { members: MemberConfig }) => {
  const allUsers = members.allUsers();
  return (
    <>
      <div>
        슬랙 이모지와 일치하지 않는 상태에 있는 유저는 빨간색으로 표시됩니다.
      </div>
      <div>
        <span>🏡 상태 이모지를 가진 유저 - </span>
        {usersToNode(
          allUsers.filter(
            (user) => user.slackUser?.statusEmoji === ":house_with_garden:",
          ),
          (u) => !members.isUserRemote(u.id),
        )}
      </div>
      <div>
        <span>🌴 상태 이모지를 가진 유저 - </span>
        {usersToNode(
          allUsers.filter(
            (user) => user.slackUser?.statusEmoji === ":palm_tree:",
          ),
          (u) => !members.isUserExcluded(u.id),
        )}
      </div>
    </>
  );
};

const usersToNode = (
  users: NormalUser[],
  isHighlighted: (u: NormalUser) => boolean,
) => {
  if (users.length === 0) {
    return <span>없음</span>;
  }
  return users
    .map<React.ReactNode>((u) => (
      <>
        <span key={u.id} className={isHighlighted(u) ? "red" : ""}>
          {u.name}
        </span>
        <style jsx>
          {`
            .red {
              color: red;
            }
          `}
        </style>
      </>
    ))
    .reduce((prev, curr) => [prev, " ", curr]);
};
