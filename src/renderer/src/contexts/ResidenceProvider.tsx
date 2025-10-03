import { useState } from "react";
import { ResidenceContext } from "./ResidenceContext";
import { HabitatModule, MonthlySummery, SmartBin, TrashItem } from "@renderer/lib/types";

export default function ResidenceProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
    
  const [selectedScene, setSelectedScene] = useState<"MainMenu" | "Jezero" | HabitatModule | null>(null);
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
