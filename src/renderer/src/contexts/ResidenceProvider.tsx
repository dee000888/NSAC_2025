import { useState } from "react";
import { ResidenceContext } from "./ResidenceContext";
import { HabitatModuleEnum, MonthlySummery, SmartBinSchema, TrashItemSchema } from "@renderer/lib/types";

export default function ResidenceProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
    
  const [selectedScene, setSelectedScene] = useState<"MainMenu" | "Jezero" | HabitatModuleEnum>("Jezero");
  const [smartBins, setSmartBins] = useState<SmartBinSchema[]>([]);
  const [trashItems, setTrashItems] = useState<TrashItemSchema[]>([]);
  const [monthlySummery, setMonthlySummery] = useState<MonthlySummery[]>([]);
  
  return (
    <ResidenceContext.Provider value={{ 
      selectedScene, setSelectedScene,
      smartBins, setSmartBins,
      trashItems, setTrashItems,
      monthlySummery, setMonthlySummery }}>
      {children}
    </ResidenceContext.Provider>
  );
  
}
