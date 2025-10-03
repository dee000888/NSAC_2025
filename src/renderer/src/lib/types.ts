export enum HabitatModuleType {
  LivingSpaceModule = "LivingSpaceModule",
  StorageModule = "StorageModule",
  SurgicalModule = "SurgicalModule",
  LabModule = "LabModule",
  RecyclingModule = "RecyclingModule",
  PlantationModule = "PlantationModule"
}

export enum SmartBinType {
  INDOOR = "INDOOR",
  OUTDOOR = "OUTDOOR",
  INSTATION = "INSTATION"
}

export type SmartBin = {
  binId: string;
  moduleName: HabitatModuleType | null;
  binType: SmartBinType;
  filledPercentage: number;
}

export enum TrashCategory {
  FABRIC = "FABRIC",
  PLASTIC = "PLASTIC",
  GLASS = "GLASS",
  METAL = "METAL",
  PAPER = "PAPER",
  COMPOSITE = "COMPOSITE"
}

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
