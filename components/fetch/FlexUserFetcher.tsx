import { Button } from "@mui/material";
import { useEffect } from "react";
import { LunchUser } from "../../utils/domain/LunchUser";
import { FlexService } from "../../utils/flex/FlexService";

export function FlexUserFetcher({
  users,
  setUsers,
}: {
  users: LunchUser[];
  setUsers: (users: LunchUser[]) => void;
}) {
  useEffect(() => {
    // fetch("/api/hello")
    //   .then((response) => response.json())
    //   .then((data) => console.log(data));
  }, []);

  return users.length === 0 ? null : (
    <div>
      <Button>Import setting from Flex(NOP) </Button>
    </div>
  );
}
