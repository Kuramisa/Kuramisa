export interface ValorantResponse<T> {
    status: number;
    data?: T;
    error?: string;
}

// API Endpoints

export type APIValorantCosmeticsEndpoints =
    | "buddies"
    | "bundles"
    | "contenttiers"
    | "levelborders"
    | "playercards"
    | "playertitles"
    | "sprays"
    | "weapons/skins";

export type APIValorantInfoEndpoints =
    | "agents"
    | "ceremonies"
    | "seasons/competitive"
    | "competitivetiers"
    | "contracts"
    | "currencies"
    | "events"
    | "gamemodes"
    | "maps"
    | "missions"
    | "objectives"
    | "seasons"
    | "themes"
    | "version"
    | "weapons";

export type APIValorantEndpoints =
    | APIValorantCosmeticsEndpoints
    | APIValorantInfoEndpoints;

// Valorant API Data
export interface APIValorantAgent {
    uuid: string;
    displayName: string;
    description: string;
    developerName: string;
    characterTags: string[];
    displayIcon: string;
    displayIconSmall: string;
    bustPortrait: string;
    fullPortrait: string;
    fullPortraitV2: string;
    killfeedPortrait: string;
    background: string;
    backgroundGradientColors: string[];
    assetPath: string;
    isFullPortraitRightFacing: boolean;
    isPlayableCharacter: boolean;
    isAvailableForTest: boolean;
    isBaseContent: boolean;
    role: {
        uuid: string;
        displayName: string;
        description: string;
        displayIcon: string;
        assetPath: string;
    };
    recruitmentData: {
        counterId: string;
        milestoneId: string;
        milestoneThreshold: number;
        useLevelVpCostOverride: boolean;
        levelVpCostOverride: number;
        startDate: string | Date;
        endDate: string | Date;
    };
    abilities: {
        slot: string;
        displayName: string;
        description: string;
        displayIcon: string;
    }[];
    voiceLines: {
        minDuration: number;
        maxDuration: number;
        mediaList: {
            id: number;
            wwise: string;
            wave: string;
        }[];
    };
}

export interface APIValorantBuddyLevel {
    uuid: string;
    charmLevel: number;
    hideIfNotOwned: boolean;
    displayName: string;
    displayIcon: string;
    assetPath: string;
}

export interface APIValorantBuddy {
    uuid: string;
    displayName: string;
    isHiddenIfNotOwned: boolean;
    themeUuid: string;
    displayIcon: string;
    assetPath: string;
    levels: APIValorantBuddyLevel[];
}

export interface APIValorantBundle {
    uuid: string;
    displayName: string;
    displayNameSubText: string;
    description: string;
    extraDescription: string;
    promoDescription: string;
    useAdditionalContext: boolean;
    displayIcon: string;
    displayIcon2: string;
    logoIcon: string;
    verticalPromoImage: string;
    assetPath: string;
}

export interface APIValorantCeremony {
    uuid: string;
    displayName: string;
    assetPath: string;
}

export interface APIValorantCompetitiveRank {
    tier: number;
    tierName: string;
    division: string;
    divisionName: string;
    color: string;
    backgroundColor: string;
    smallIcon: string;
    largeIcon: string;
    rankTriangleDownIcon: string;
    rankTriangleUpIcon: string;
}

export interface APIValorantCompetitiveTier {
    uuid: string;
    assetObjectName: string;
    tiers: APIValorantCompetitiveRank[];
    assetPath: string;
}

export interface APIValorantContentTier {
    uuid: string;
    displayName: string;
    devName: string;
    rank: number;
    juiceValue: number;
    juiceCost: number;
    highlightColor: string;
    displayIcon: string;
    assetPath: string;
}

export interface APIValorantContract {
    uuid: string;
    displayName: string;
    displayIcon: string;
    shipIt: boolean;
    useLevelVPCostOverride: boolean;
    levelVPCostOverride: number;
    freeRewardScheduleUuid: string;
    content: {
        relationType: string;
        relationUuid: string;
        chapters: {
            isEpilogue: boolean;
            levels: {
                reward: {
                    type: string;
                    uuid: string;
                    amount: number;
                    isHighlighted: boolean;
                };
                xp: number;
                vpCost: number;
                isPurchasableWithVP: boolean;
                doughCost: number;
                isPurchasableWithDough: boolean;
            }[];
            freeRewards: {
                type: string;
                uuid: string;
                amount: number;
                isHighlighted: boolean;
            }[];
        }[];
        premiumRewardScheduleUuid: string;
        premiumVPCost: number;
    };
    assetPath: string;
}

export interface APIValorantCurrency {
    uuid: string;
    displayName: string;
    displayNameSingular: string;
    displayIcon: string;
    largeIcon: string;
    assetPath: string;
}

export interface APIValorantEvent {
    uuid: string;
    displayName: string;
    shortDisplayName: string;
    startTime: string | Date;
    endTime: string | Date;
    assetPath: string;
}

export interface APIValorantGamemode {
    uuid: string;
    displayName: string;
    duration: string;
    economyType: string;
    allowsMatchTimeouts: boolean;
    isTeamVoiceAllowed: boolean;
    isMinimapHidden: boolean;
    orbCount: number;
    /**
     * `-1` means no data was available
     */
    roundsPerHalf: number;
    teamRoles: string[];
    gameFeatureOverrides: {
        featureName: string;
        state: boolean;
    }[];
    gameRuleBoolOverrides: {
        ruleName: string;
        state: boolean;
    }[];
    displayIcon: string;
    listViewIconTall: string;
    assetPath: string;
}

export interface APIValorantGear {
    uuid: string;
    displayName: string;
    description: string;
    displayIcon: string;
    assetPath: string;
    shopData: {
        cost: number;
        category: string;
        shopOrderPriority: number;
        categoryText: string;
        gridPosition: {
            row: number;
            column: number;
        };
        canBeTrashed: boolean;
        image: string;
        newImage: string;
        newImage2: string;
        assetPath: string;
    };
}

export interface APIValorantLevelBorder {
    uuid: string;
    displayName: string;
    startingLevel: number;
    levelNumberAppearance: string;
    smallPlayerCardAppearance: string;
    assetPath: string;
}

export interface APIValorantMap {
    uuid: string;
    displayName: string;
    narrativeDescription: string;
    tacticalDescription: string;
    coordinates: string;
    displayIcon: string;
    listViewIcon: string;
    listViewIconTall: string;
    splash: string;
    stylizedBackgroundImage: string;
    premierBackgroundImage: string;
    assetPath: string;
    mapUrl: string;
    xMultiplier: number;
    yMultiplier: number;
    xScalarToAdd: number;
    yScalarToAdd: number;
    callouts: {
        regionName: string;
        superRegionName: string;
        location: {
            x: number;
            y: number;
        };
    }[];
}

export interface APIValorantMission {
    uuid: string;
    displayName: string;
    title: string;
    type: string;
    xpGrant: number;
    progressToComplete: number;
    activationDate: string | Date;
    expirationDate: string | Date;
    tags: string[];
    objectives: {
        objectiveUuid: string;
        value: number;
    }[];
    assetPath: string;
}

export interface APIValorantObjective {
    uuid: string;
    directive: string;
    assetPath: string;
}

export interface APIValorantPlayerCard {
    uuid: string;
    displayName: string;
    isHiddenIfNotOwned: boolean;
    themeUuid: string;
    displayIcon: string;
    smallArt: string;
    wideArt: string;
    largeArt: string;
    assetPath: string;
}

export interface APIValorantPlayerTitle {
    uuid: string;
    displayName: string;
    titleText: string;
    isHiddenIfNotOwned: boolean;
    assetPath: string;
}

export interface APIValorantSeason {
    uuid: string;
    displayName: string;
    type: string;
    startTime: string | Date;
    endTime: string | Date;
    parentUuid: string;
    assetPath: string;
}

export interface APIValorantCompetitiveSeason {
    uuid: string;
    startTime: string | Date;
    endTime: string | Date;
    seasonUuid: string;
    competitiveTiersUuid: string;
    borders: {
        uuid: string;
        level: number;
        winsRequired: number;
        displayIcon: string;
        smallIcon: string;
        assetPath: string;
    }[];
    assetPath: string;
}

export interface APIValorantSprayLevel {
    uuid: string;
    sprayLevel: number;
    displayName: string;
    displayIcon: string;
    assetPath: string;
}

export interface APIValorantSpray {
    uuid: string;
    displayName: string;
    category: string;
    themeUuid: string;
    isNullSpray: boolean;
    hideIfNotOwned: boolean;
    displayIcon: string;
    fullIcon: string;
    fullTransparentIcon: string;
    animationPng: string;
    animationGif?: string;
    assetPath: string;
    levels: APIValorantSprayLevel[];
}

export interface APIValorantTheme {
    uuid: string;
    displayName: string;
    displayIcon: string;
    storeFeaturedImage: string;
    assetPath: string;
}

export interface APIValorantVersion {
    manifestId: string;
    branch: string;
    version: string;
    buildVersion: string;
    engineVersion: string;
    riotClientVersion: string;
    riotClientBuild: string;
    buildDate: string | Date;
}

export interface APIValorantSkinChroma {
    uuid: string;
    displayName: string;
    displayIcon: string;
    fullRender?: string;
    swatch: string;
    streamedVideo: string;
    assetPath: string;
}

export interface APIValorantSkinLevel {
    uuid: string;
    displayName: string;
    levelItem: string;
    displayIcon: string;
    streamedVideo: string;
    assetPath: string;
}

export interface APIValorantSkin {
    uuid: string;
    displayName: string;
    themeUuid: string;
    contentTierUuid: string;
    displayIcon: string;
    wallpaper: string;
    assetPath: string;
    chromas: APIValorantSkinChroma[];
    levels: APIValorantSkinLevel[];
}

export interface APIValorantWeapon {
    uuid: string;
    displayName: string;
    category?: string;
    defaultSkinUuid: string;
    displayIcon: string;
    killStreamIcon: string;
    assetPath: string;
    weaponStats: {
        fireRate: number;
        magazineSize: number;
        runSpeedMultiplier: number;
        equipTimeSeconds: number;
        reloadTimeSeconds: number;
        firstBulletAccuracy: number;
        shotgunPelletCount: number;
        wallPenetration: string;
        feature: string;
        fireMode: string;
        altFireType: string;
        adsStats: {
            zoomMultiplier: number;
            fireRate: number;
            runSpeedMultiplier: number;
            burstCount: number;
            firstBulletAccuracy: number;
        };
        altShotgunStats: {
            shotgunPelletCount: number;
            burstRate: number;
        };
        airBurstStats: {
            shotgunPelletCount: number;
            burstDistance: number;
        };
        damageRanges: {
            rangeStartMeters: number;
            rangeEndMeters: number;
            headDamage: number;
            bodyDamage: number;
            legDamage: number;
        }[];
    };
    shopData?: {
        cost: number;
        category: string;
        shopOrderPriority: number;
        categoryText: string;
        gridPosition: {
            row: number;
            column: number;
        };
        canBeTrashed: boolean;
        image: string;
        newImage: string;
        newImage2: string;
        assetPath: string;
    };
    skins: APIValorantSkin[];
}

export type APIValorantCosmetics =
    | APIValorantBuddy[]
    | APIValorantBundle[]
    | APIValorantLevelBorder[]
    | APIValorantPlayerCard[]
    | APIValorantPlayerTitle[]
    | APIValorantSkins[]
    | APIValorantSpray[];

export type APIValorantInfo =
    | APIValorantAgent[]
    | APIValorantCeremony[]
    | APIValorantCompetitiveSeason[]
    | APIValorantCompetitiveTier[]
    | APIValorantContentTier[]
    | APIValorantContract[]
    | APIValorantCurrency[]
    | APIValorantEvent[]
    | APIValorantGamemode[]
    | APIValorantGear[]
    | APIValorantMap[]
    | APIValorantMission[]
    | APIValorantObjective[]
    | APIValorantSeason[]
    | APIValorantTheme[]
    | APIValorantVersion
    | APIValorantWeapon[];

export type APIValorant = APIValorantCosmetics | APIValorantInfo;
