import { Message } from "discord.js";

declare global {
    interface IValorantAgent {
        uuid: string;
        displayName: string;
        description: string;
        developerName: string;
        characterTags: string;
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
}

declare module "discord.js" {
    export interface Guild {
        musicMessage?: Message | null;
    }
}
