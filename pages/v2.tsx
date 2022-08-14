import { useState } from "react";
import { MainGroupComopnent } from "../components/main/MainGroupComponent";
import { MainMessageComponent } from "../components/main/MainMessageComponent";

export default () => {
  const [step, setStep] = useState(0);
  return (
    <>
      {step === 0 ? (
        <MainGroupComopnent onStepIncrement={() => setStep(1)} />
      ) : (
        <MainMessageComponent onStepDecrement={() => setStep(0)} />
      )}
    </>
  );
};
