export type HabitatModule = "LivingSpaceModule" |
  "StorageModule" |
  "SurgicalModule" |
  "LabModule" |
  "RecyclingModule" |
  "PlantationModule";
  
export type SmartBinType = "INDOOR" |
  "OUTDOOR" |
  "INSTATION";

export type SmartBin = {
  binId: string;
  moduleName: HabitatModule | null;
  binType: SmartBinType;
  totalWeight: number;
  filledWeight: number;
  filledPercentage: number;
}

export type TrashCategory = "FABRIC" |
  "PLASTIC" |
  "GLASS" |
  "METAL" |
  "PAPER" |
  "COMPOSITE";

export type TrashItem = {
  trashId: string;
  binId: string;
  category: TrashCategory;
  codeName: string;
  weight: number;
}

export type MonthlySummery = {
  month: string;
  year: number;
  
  totalFabricCollected: number;
  totalPlasticCollected: number;
  totalGlassCollected: number;
  totalMetalCollected: number;
  totalPaperCollected: number;
  totalCompositeCollected: number;
  
  totalFabricRecycled: number;
  totalPlasticRecycled: number;
  totalGlassRecycled: number;
  totalMetalRecycled: number;
  totalPaperRecycled: number;
  totalCompositeRecycled: number;
}
