import { NextPage } from "next/types";
import { useState } from "react";
import { SupabaseSlackAuth } from "../components/auth/SupabaseSlackAuth";
import { MainComponent } from "../components/MainComponent";

const Home: NextPage = () => {
  return (
    <>
      <SupabaseSlackAuth />
      <MainComponent />
    </>
  );
};

export default Home;
