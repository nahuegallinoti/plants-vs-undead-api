export interface Selected {
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

export interface Getters {
    elements: Elements;
    capacity: Capacity;
}

export interface Paths {
    isDefaultLand: string;
    rarity: string;
    y: string;
    x: string;
    landId: string;
    _id: string;
    __v: string;
}

export interface Ignore {
}

export interface Default {
}

export interface Init {
    _id: boolean;
    isDefaultLand: boolean;
    landId: boolean;
    x: boolean;
    y: boolean;
    rarity: boolean;
    __v: boolean;
}

export interface Modify {
}

export interface Require {
}

export interface States {
    ignore: Ignore;
    default: Default;
    init: Init;
    modify: Modify;
    require: Require;
}

export interface ActivePaths {
    paths: Paths;
    states: States;
    stateNames: string[];
}

export interface PathsToScopes {
}

export interface CachedRequired {
}

export interface SetCalled {
}

export interface Events {
}

export interface Emitter {
    _events: Events;
    _eventsCount: number;
    _maxListeners: number;
}

export interface Options {
    skipId: boolean;
    isNew: boolean;
    willInit: boolean;
    defaults: boolean;
}

export interface $__{
    strictMode: boolean;
    selected: Selected;
    getters: Getters;
    _id: string;
    wasPopulated: boolean;
    activePaths: ActivePaths;
    pathsToScopes: PathsToScopes;
    cachedRequired: CachedRequired;
    $setCalled: SetCalled;
    emitter: Emitter;
    $options: Options;
    nestedPath: string;
}

export interface Locals {
}

export interface Elements2 {
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

export interface Capacity2 {
    plant: number;
    motherTree: number;
}

export interface Doc {
    elements: Elements2;
    capacity: Capacity2;
    isDefaultLand: boolean;
    _id: string;
    landId: number;
    x: number;
    y: number;
    totalOfElements: number;
    rarity: number;
    __v: number;
}

export interface Data {    
    isNew: boolean;
    $locals: Locals;
    $op?: any;
    _doc: Doc;
    $init: boolean;
    ownerId: string;
}

export interface LandResponse {
    status: number;
    data: Data;
}
