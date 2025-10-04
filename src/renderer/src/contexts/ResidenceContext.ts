import { HabitatModuleEnum, MonthlySummery, SmartBinSchema, TrashItemSchema } from "@renderer/lib/types";
import { createContext } from "react";

export const ResidenceContext = createContext<{
  selectedScene: "Jezero" | "MainMenu" | HabitatModuleEnum,
  setSelectedScene: React.Dispatch<React.SetStateAction<"Jezero" | "MainMenu" | HabitatModuleEnum>>
  smartBins: SmartBinSchema[];
  setSmartBins: React.Dispatch<React.SetStateAction<SmartBinSchema[]>>;
  trashItems: TrashItemSchema[];
  setTrashItems: React.Dispatch<React.SetStateAction<TrashItemSchema[]>>;
  monthlySummery: MonthlySummery[];
  setMonthlySummery: React.Dispatch<React.SetStateAction<MonthlySummery[]>>;
} | null>(null);
