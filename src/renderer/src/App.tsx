import { useContext } from "react";
import { ResidenceContext } from "./contexts/ResidenceContext";
import Jezero from "./jezero/Jezero";
import HabitatModule from "./habitatModule/HabitatModule";
import { HabitatModuleEnum } from "./lib/types";

export default function App(): React.JSX.Element {
  
  const residenceContext = useContext(ResidenceContext);

  if (!residenceContext) {
    return <div>Loading...</div>;
  }
  
  if (!residenceContext.selectedScene) {
    return <div>Loading...</div>;
  }

  if (residenceContext.selectedScene === "Jezero") return <Jezero />;
  
  if ((Object.keys(HabitatModuleEnum) as (keyof typeof HabitatModuleEnum)[])
        .includes(residenceContext.selectedScene as any))  return <HabitatModule moduleName={residenceContext.selectedScene as HabitatModuleEnum} />;
  
  return <Jezero />;
  
}
