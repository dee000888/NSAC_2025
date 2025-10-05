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
  filledPercentage: number;
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
  SULFUR_COMPOUNDS = "SULFUR_COMPOUNDS",
  POLYETHYLENE = "POLYETHYLENE",
  ALUMINUM = "ALUMINUM",
  ADHESIVE_RESIDUE = "ADHESIVE_RESIDUE",
  EVOH = "EVOH",
  PET = "PET",
  CONDUCTIVE_ADDITIVES = "CONDUCTIVE_ADDITIVES",
  POLYETHYLENE_FOAM = "POLYETHYLENE_FOAM",
  NOMEX = "NOMEX",
  ALUMINUM_OXIDE = "ALUMINUM_OXIDE",
  CARBON_FIBER = "CARBON_FIBER",
  EPOXY_RESIN = "EPOXY_RESIN",
  PYROLYSIS_OIL = "PYROLYSIS_OIL",
  CHAR = "CHAR",
  FABRIC_BACKING = "FABRIC_BACKING",
  LIGNIN = "LIGNIN",
  POLYPROPYLENE = "POLYPROPYLENE",
  SILICONE_RUBBER = "SILICONE_RUBBER",
  SILICONE = "SILICONE",
  ALUMINUM_TUBE = "ALUMINUM_TUBE",
  PLASTIC_CAP = "PLASTIC_CAP",
  ACRYLIC_ADHESIVE = "ACRYLIC_ADHESIVE",
  PAPER_BACKING = "PAPER_BACKING",
  PAPER = "PAPER",
  PLASTIC_COATING = "PLASTIC_COATING",
  INK_RESIDUE = "INK_RESIDUE",
  INK = "INK",
  METAL_SPRING = "METAL_SPRING",
  FELT = "FELT",
  STEEL = "STEEL",
  PLASTIC_HANDLE = "PLASTIC_HANDLE",
  PVC = "PVC",
  COPPER = "COPPER",
  ELASTANE = "ELASTANE",
  POLYESTER_FILL = "POLYESTER_FILL",
  ALUMINUM_FOIL = "ALUMINUM_FOIL",
  CARBON = "CARBON"
}

export enum RecycleProcessEnum {
  MECHANICAL_SHREDDING = "MECHANICAL_SHREDDING",
  PULPING = "PULPING",
  FIBER_EXTRACTION = "FIBER_EXTRACTION",
  FIBER_SEPARATION = "FIBER_SEPARATION",
  WATER_EXTRACTION = "WATER_EXTRACTION",
  DEVULCANIZATION = "DEVULCANIZATION",
  MECHANICAL_GRINDING = "MECHANICAL_GRINDING",
  REFORMING = "REFORMING",
  THERMAL_SEPARATION = "THERMAL_SEPARATION",
  LAYER_DELAMINATION = "LAYER_DELAMINATION",
  MECHANICAL_RECYCLING = "MECHANICAL_RECYCLING",
  DENSITY_SEPARATION = "DENSITY_SEPARATION",
  MELT_EXTRUSION = "MELT_EXTRUSION",
  PELLETIZING = "PELLETIZING",
  FILTRATION = "FILTRATION",
  DEFLATION = "DEFLATION",
  MECHANICAL_COMPRESSION = "MECHANICAL_COMPRESSION",
  SHREDDING = "SHREDDING",
  PYROLYSIS = "PYROLYSIS",
  CARBON_CHAR_EXTRACTION = "CARBON_CHAR_EXTRACTION",
  MECHANICAL_CUTTING = "MECHANICAL_CUTTING",
  MELTING = "MELTING",
  DROSS_REMOVAL = "DROSS_REMOVAL",
  CASTING = "CASTING",
  DISASSEMBLY = "DISASSEMBLY",
  FIBER_RECOVERY = "FIBER_RECOVERY",
  RESIN_DECOMPOSITION = "RESIN_DECOMPOSITION",
  CHAR_EXTRACTION = "CHAR_EXTRACTION",
  FIBER_SPINNING = "FIBER_SPINNING",
  MOLDING = "MOLDING",
  MECHANICAL_STRIPPING = "MECHANICAL_STRIPPING",
  MECHANICAL_SEPARATION = "MECHANICAL_SEPARATION",
  MATERIAL_SORTING = "MATERIAL_SORTING",
  RECYCLING_BY_TYPE = "RECYCLING_BY_TYPE",
  MECHANICAL_CLEANING = "MECHANICAL_CLEANING",
  INK_REMOVAL = "INK_REMOVAL"
}

// Manufacturing Processes Enum - Processes for creating new items
export enum ManufactureProcessEnum {
  THREE_D_PRINTING = "THREE_D_PRINTING",
  HAND_CRAFTING = "HAND_CRAFTING",
  INJECTION_MOLDING = "INJECTION_MOLDING",
  COMPRESSION_MOLDING = "COMPRESSION_MOLDING",
  EXTRUSION_MOLDING = "EXTRUSION_MOLDING",
  THERMOFORMING = "THERMOFORMING",
  CASTING = "CASTING",
  WELDING = "WELDING",
  MECHANICAL_ASSEMBLY = "MECHANICAL_ASSEMBLY",
  SINTERING = "SINTERING",
  WEAVING = "WEAVING",
  PRESSING = "PRESSING",
  LAMINATING = "LAMINATING",
  CNC_MACHINING = "CNC_MACHINING",
  FIBER_LAYING = "FIBER_LAYING",
  PULP_MOLDING = "PULP_MOLDING",
  ADHESIVE_BONDING = "ADHESIVE_BONDING",
  SEWING = "SEWING",
  VACUUM_FORMING = "VACUUM_FORMING",
  CUTTING_AND_SHAPING = "CUTTING_AND_SHAPING"
}
