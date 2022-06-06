import { NextPage } from "next/types";
import { SupabaseAnonAuth } from "../components/auth/SupabaseAnonAuth";
import { MainComponent } from "../components/MainComponent";

const Home: NextPage = () => {
  return (
    <>
      <SupabaseAnonAuth />
      <MainComponent />
    </>
  );
};

export default Home;
