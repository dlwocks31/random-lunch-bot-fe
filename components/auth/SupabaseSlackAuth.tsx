import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase/supabaseClient";

export function SupabaseSlackAuth() {
  const [userEmail, setUserEmail] = useState("");
  useEffect(() => {
    setUserEmail(supabase.auth.user()?.email || "");
    console.log(supabase.auth.user());
  });
  const runOauth = async () => {
    const { user, session, error } = await supabase.auth.signIn({
      provider: "slack",
    });
    setUserEmail(user?.email || "");
    console.log(user);
  };
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    setUserEmail("");
  };
  return (
    <div>
      <div>Current User: {userEmail}</div>
      <Button onClick={runOauth}>Auth Login</Button>
      <Button onClick={signOut}>Logout</Button>
    </div>
  );
}
