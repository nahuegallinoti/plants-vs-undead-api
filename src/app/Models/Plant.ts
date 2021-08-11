export interface Rate {
    le: number;
    hours: number;
}

export interface Elements {
    fire: number;
    water: number;
    ice: number;
    wind: number;
    electro: number;
    parasite: number;
    light: number;
    dark: number;
    metal: number;
}

export interface Capacity {
    plant: number;
    motherTree: number;
}

export interface Land {
    elements: Elements;
    capacity: Capacity;
    landId: number;
    x: number;
    y: number;
    totalOfElements: number;
    rarity: number;
}

export interface FarmConfig {
    le: number;
    hours: number;
}

export interface Stats {
    type: string;
    hp: number;
    defPhysics: number;
    defMagic: number;
    damagePhysics: number;
    damageMagic: number;
    damagePure: number;
    damageHpLoss: number;
    damageHpRemove: number;
}

export interface Synergy {
    requirement: number;
    description: string;
}

export interface Plant {
    farmConfig: FarmConfig;
    stats: Stats;
    type: number;
    iconUrl: string;
    rarity: number;
    synergy: Synergy;
}

export interface ActiveTool {
    count: number;
    farmId: string;
    id: number;
    type: string;
    startTime: Date;
    name: string;
    description: string;
}

export interface WaterStatus {
    needWater: boolean;
}

export interface Datum {
    _id: string;
    stage: string;
    ownerId: string;
    landId: number;
    plantId: number;
    plantUnitId: number;
    plantType: number;
    plantElement: string;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
    harvestTime: Date;
    rate: Rate;
    startTime: Date;
    land: Land;
    plant: Plant;
    hasSynergy: boolean;
    activeTools: ActiveTool[];
    waterStatus: WaterStatus;
    hasSeed: boolean;
    hasCrow: boolean;
    inGreenhouse: boolean;
    totalHarvest: number;
    totalExtraHarvest: number;
    count: number;
    pausedTime?: any;
}

export interface PlantResponse {
    status: number;
    data: Datum[];
    total: number;
}