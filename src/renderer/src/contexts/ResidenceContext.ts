import { HabitatModuleType, MonthlySummery, SmartBin, TrashItem } from "@renderer/lib/types";
import { createContext } from "react";

export const ResidenceContext = createContext<{
  selectedScene: "Jezero" | "MainMenu" | HabitatModuleType | null,
  setSelectedScene: React.Dispatch<React.SetStateAction<"Jezero" | "MainMenu" | HabitatModuleType | null>>
  smartBins: SmartBin[];
  setSmartBins: React.Dispatch<React.SetStateAction<SmartBin[]>>;
  trashItems: TrashItem[];
  setTrashItems: React.Dispatch<React.SetStateAction<TrashItem[]>>;
  monthlySummery: MonthlySummery[];
  setMonthlySummery: React.Dispatch<React.SetStateAction<MonthlySummery[]>>;
} | null>(null);
