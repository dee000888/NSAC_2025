import { useState } from "react";
import { ResidenceContext } from "./ResidenceContext";
import { HabitatModuleType, MonthlySummery, SmartBin, TrashItem } from "@renderer/lib/types";

export default function ResidenceProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
    
  const [selectedScene, setSelectedScene] = useState<"MainMenu" | "Jezero" | HabitatModuleType | null>("Jezero");
  const [smartBins, setSmartBins] = useState<SmartBin[]>([]);
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
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
