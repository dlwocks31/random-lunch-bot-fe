import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "../../utils/supabase/supabaseClient";

export function SupabaseAnonAuth() {
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const currentUser = supabase.auth.user();
    if (!currentUser) {
      const email = `${uuidv4()}@anon-login.com`;
      const password = uuidv4();
      supabase.auth
        .signUp({ email, password })
        .then(({ user }) => setUserEmail(user?.email || ""));
    } else {
      setUserEmail(currentUser.email || "");
    }
  });
  return (
    <div>
      <div>Current User: {userEmail}</div>
      {userEmail && <div>Shown on login</div>}
    </div>
  );
}
