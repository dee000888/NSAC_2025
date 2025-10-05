export enum HabitatModuleEnum {
  LivingSpaceModule = "LivingSpaceModule",
  StorageModule = "StorageModule",
  SurgicalModule = "SurgicalModule",
  LabModule = "LabModule",
  RecyclingModule = "RecyclingModule",
  PlantationModule = "PlantationModule"
}

export enum BinMobilityEnum {
  INDOOR = "INDOOR",
  INSTATION = "INSTATION"
}

export type SmartBinSchema = {
  binId: string;
  moduleName: HabitatModuleEnum;
  mobility: BinMobilityEnum;
}

export enum TrashCategoryEnum {
  FABRIC = "FABRIC",
  PLASTIC = "PLASTIC",
  GLASS = "GLASS",
  METAL = "METAL",
  PAPER = "PAPER",
  COMPOSITE = "COMPOSITE"
}

export type TrashItemSchema = {
  trashId: string;
  binId: string;
  codeName: string;
  quantity: number;
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







export enum ManuFactoryApplicationEnum {
  RENOVATION = "RENOVATION",
  CELEBRATION = "CELEBRATION",
  DISCOVERY = "DISCOVERY"
}

export enum ItemCategoryEnum {
  FABRIC = "FABRIC",
  POLYMER = "POLYMER",
  GLASS = "GLASS",
  METAL = "METAL",
  COMPOSITE = "COMPOSITE",
  PAPER = "PAPER"
}

export type ConsumableItemSchema = {
  name: string;
  codeName: string;
  category: ItemCategoryEnum;
  quantity: number;
  weight_kg: number;
  recycleProcess: {
    process: RecycleProcessEnum;
    outputMaterials: {
      [key: string]: number;
    };
  };
}

export type ManufacturableItemSchema = {
  itemName: string;
  manufactureProcess: {
    process: ManufactureProcessEnum,
    rawMaterials: {
      [key: string]: number;
    };
  };
  application: ManuFactoryApplicationEnum;
}


export enum RawMaterialEnum {
  COTTON = "COTTON",
  CELLULOSE_FIBER = "CELLULOSE_FIBER",
  POLYESTER = "POLYESTER",
  NYLON = "NYLON",
  WATER = "WATER",
  NITRILE_RUBBER = "NITRILE_RUBBER",
  POLYETHYLENE = "POLYETHYLENE",
  ALUMINUM = "ALUMINUM",
  ADHESIVE_RESIDUE = "ADHESIVE_RESIDUE",
  PET = "PET",
  POLYETHYLENE_FOAM = "POLYETHYLENE_FOAM",
  ALUMINUM_OXIDE = "ALUMINUM_OXIDE",
  CARBON_FIBER = "CARBON_FIBER",
  EPOXY_RESIN = "EPOXY_RESIN",
  CHAR = "CHAR",
  FABRIC_BACKING = "FABRIC_BACKING",
  LIGNIN = "LIGNIN",
  POLYPROPYLENE = "POLYPROPYLENE",
  SILICONE_RUBBER = "SILICONE_RUBBER",
  PLASTIC_CAP = "PLASTIC_CAP",
  PAPER_BACKING = "PAPER_BACKING",
  PAPER = "PAPER",
  PLASTIC_COATING = "PLASTIC_COATING",
  INK_RESIDUE = "INK_RESIDUE",
  INK = "INK",
  STEEL = "STEEL",
  COPPER = "COPPER",
  ALUMINUM_FOIL = "ALUMINUM_FOIL",
  CARBON = "CARBON",
  MARS_REGOLITH = "MARS_REGOLITH",
  PHOSPHORIC_ACID = "PHOSPHORIC_ACID",
  SODIUM_SILICATE = "SODIUM_SILICATE",
  CHITIN = "CHITIN"
}

export enum RecycleProcessEnum {
  MECHANICAL_SHREDDING = "MECHANICAL_SHREDDING",
  PULPING = "PULPING",
  FIBER_EXTRACTION = "FIBER_EXTRACTION",
  MELT_EXTRUSION = "MELT_EXTRUSION",
  CRUSHING = "CRUSHING",
  WASHING = "WASHING",
  MECHANICAL_CUTTING = "MECHANICAL_CUTTING",
  MELTING = "MELTING",
  MECHANICAL_STRIPPING = "MECHANICAL_STRIPPING",
  MECHANICAL_GRINDING = "MECHANICAL_GRINDING",
  MECHANICAL_DELAMINATION = "MECHANICAL_DELAMINATION"
}

// Manufacturing Processes Enum - Processes for creating new items
export enum ManufactureProcessEnum {
  INJECTION_MOLDING = "INJECTION_MOLDING",
  COMPRESSION_MOLDING = "COMPRESSION_MOLDING",
  EXTRUSION_MOLDING = "EXTRUSION_MOLDING",
  MECHANICAL_ASSEMBLY = "MECHANICAL_ASSEMBLY",
  LAMINATING = "LAMINATING",
  CNC_MACHINING = "CNC_MACHINING",
  PULP_MOLDING = "PULP_MOLDING",
  ADHESIVE_BONDING = "ADHESIVE_BONDING",
  SEWING = "SEWING",
  CUTTING_AND_SHAPING = "CUTTING_AND_SHAPING"
}
