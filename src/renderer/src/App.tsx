import { useContext } from "react";
import { ResidenceContext } from "./contexts/ResidenceContext";
import Jezero from "./jezero/Jezero";
import HabitatModule from "./habitatModule/HabitatModule";
import { HabitatModuleType } from "./lib/types";

export default function App(): React.JSX.Element {
  
  const residenceContext = useContext(ResidenceContext);

  if (!residenceContext) {
    return <div>Loading...</div>;
  }
  
  if (!residenceContext.selectedScene) {
    return <div>Loading...</div>;
  }

  if (residenceContext.selectedScene === "Jezero") return <Jezero />;
  
  if ((Object.keys(HabitatModuleType) as (keyof typeof HabitatModuleType)[])
        .includes(residenceContext.selectedScene as any))  return <HabitatModule moduleName={residenceContext.selectedScene as HabitatModuleType} />;
  
  return <Jezero />;
  
}
