import { NextPage } from "next/types";
import { useState } from "react";
import { SupabaseSlackAuthBar } from "../components/auth/SupabaseSlackAuthBar";
import { IntroComponent } from "../components/IntroComponent";
import { MainComponent } from "../components/MainComponent";

const Home: NextPage = () => {
  const [slackInstalled, setSlackInstalled] = useState(false);
  return (
    <>
      <SupabaseSlackAuthBar setSlackInstalled={setSlackInstalled} />
      {slackInstalled ? <MainComponent /> : <IntroComponent />}
    </>
  );
};

export default Home;
