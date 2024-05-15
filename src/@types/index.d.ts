import type {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    Collection,
    ColorResolvable,
    ContextMenuCommandInteraction,
    Guild,
    Message,
    MessageActionRowComponentBuilder,
    TextChannel,
    User,
    VoiceChannel
} from "discord.js";
import { IStaff } from "@schemas/Staff";
import { IGuild } from "@schemas/Guild";
import { IUser } from "@schemas/User";
import type { WebClient } from "valorant.ts";
import { KEmbed } from "@builders";

declare global {
    interface IMongoResult<T = any> {
        _doc: T;
    }

    type KGuild = Guild & IGuild;
    type KUser = User & IUser;

    type BotStaff = KUser & IStaff;

    type MenuType = "string" | "role" | "mentionable" | "user" | "channel";

    // Valorant Declarations

    type IValorantFeaturedBundle = {
        uuid: string;
        price: number;
        wholeSaleOnly: boolean;
        displayName: string;
        items: IValorantBundleItem &
            (
                | (IValorantWeaponSkin & { type: "skin_level" })
                | (IValorantBuddy & { type: "buddy" })
                | (IValorantSpray & { type: "spray" })
                | (IValorantPlayerCard & { type: "player_card" })
                | (IValorantPlayerTitle & { type: "player_title" })
            )[];
        secondsRemaining: number;
        expiresAt: string | Date;
    } & IValorantBundle;

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

    interface IValorantBuddyLevel {
        uuid: string;
        charmLevel: number;
        hideIfNotOwned: boolean;
        displayName: string;
        displayIcon: string;
        assetPath: string;
    }

    interface IValorantBuddy {
        uuid: string;
        displayName: string;
        isHiddenIfNotOwned: boolean;
        themeUuid: string;
        displayIcon: string;
        assetPath: string;
        levels: IValorantBuddyLevel[];
        cost: number;
    }

    interface IValorantBundle {
        uuid: string;
        displayName: string;
        displayNameSubText: string;
        description: string;
        extraDescription: string;
        promoDescription: string;
        useAdditionalContext: boolean;
        displayIcon: string;
        displayIcon2: string;
        verticalPromoImage: string;
        assetPath: string;
    }

    type IValorantBundleItem = {
        uuid: string;
        displayName: string;
        displayIcon: string;
        type: string;
        amount: number;
        discountPercent: number;
        basePrice: number;
        discountedPrice: number;
        promoItem: boolean;
    };

    interface IValorantLevelBorder {
        uuid: string;
        startingLevel: number;
        levelNumberAppearance: string;
        smallPlayerCardAppearance: string;
        assetPath: string;
    }

    interface IValorantPlayerCard {
        uuid: string;
        displayName: string;
        isHiddenIfNotOwned: boolean;
        themeUuid: string;
        displayIcon: string;
        smallArt: string;
        wideArt: string;
        largeArt: string;
        assetPath: string;
        cost: number;
    }

    interface IValorantPlayerTitle {
        uuid: string;
        displayName: string;
        titleText: string;
        isHiddenIfNotOwned: boolean;
        assetPath: string;
        cost: number;
    }

    interface IValorantWeaponSkinChroma {
        uuid: string;
        displayName: string;
        displayIcon: string;
        fullRender: string;
        swatch: string;
        streamedVideo: string;
        assetPath: string;
    }

    interface IValorantWeaponSkinLevel {
        uuid: string;
        displayName: string;
        levelItem: string;
        displayIcon: string;
        streamedVideo: string;
        assetPath: string;
    }

    interface IValorantWeaponSkin {
        uuid: string;
        displayName: string;
        themeUuid: string;
        contentTierUuid: string;
        displayIcon: string;
        wallpaper: string;
        assetPath: string;
        cost: number;
        chromas: IValorantWeaponSkinChroma[];
        levels: IValorantWeaponSkinLevel[];
    }

    interface IValorantWeapon {
        uuid: string;
        displayName: string;
        category: string;
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
        shopData: {
            cost: number;
            category: string;
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
        skins: IValorantWeaponSkin[];
    }

    interface IValorantSprayLevel {
        uuid: string;
        sprayLevel: number;
        displayName: string;
        displayIcon: string;
        assetPath: string;
    }

    interface IValorantSpray {
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
        animationGif: string;
        assetPath: string;
        cost: number;
        levels: IValorantSprayLevel[];
    }

    interface IValorantCeremony {
        uuid: string;
        displayName: string;
        assetPath: string;
    }

    interface IValorantSeason {
        uuid: string;
        displayName: string;
        type: string;
        startTime: string | Date;
        endTime: string | Date;
        parentUuid: string;
        assetPath: string;
    }

    interface IValorantCompetitiveSeason {
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

    type CompetitiveTierSingleton = {
        tier: number;
        tierName: string;
        division: string;
        divisionName: string;
        color: ColorResolvable;
        backgroundColor: ColorResolvable;
        smallIcon: string;
        largeIcon: string;
        rankTriangleDownIcon: string;
        rankTriangleUpIcon: string;
    };

    interface IValorantCompetitiveTier {
        uuid: string;
        assetObjectName: string;
        tiers: {
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
        }[];
        assetPath: string;
    }

    interface IValorantContentTier {
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

    interface IValorantContract {
        uuid: string;
        displayName: string;
        displayIcon: string;
        shipIt: boolean;
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

    interface IValorantCurrency {
        uuid: string;
        displayName: string;
        displayNameSingular: string;
        displayIcon: string;
        largeIcon: string;
        assetPath: string;
    }

    interface IValorantEvent {
        uuid: string;
        displayName: string;
        shortDisplayName: string;
        startTime: string | Date;
        endTime: string | Date;
        assetPath: string;
    }

    interface IValorantGamemode {
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
        assetPath: string;
    }

    interface IValorantGamemodeEquippable {
        uuid: string;
        displayName: string;
        category: string;
        displayIcon: string;
        killStreamIcon: string;
        assetPath: string;
    }

    interface IValorantGear {
        uuid: string;
        displayName: string;
        description: string;
        displayIcon: string;
        assetPath: string;
        shopData: {
            cost: number;
            category: string;
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

    interface IValorantMap {
        uuid: string;
        displayName: string;
        narrativeDescription: string;
        tacticalDescription: string;
        coordinates: string;
        displayIcon: string;
        listViewIcon: string;
        splash: string;
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

    interface IValorantMission {
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

    interface IValorantTheme {
        uuid: string;
        displayName: string;
        displayIcon: string;
        storeFeaturedImage: string;
        assetPath: string;
    }

    interface IValorantObjective {
        uuid: string;
        directive: string;
        assetPath: string;
    }

    interface IValorantVersion {
        manifestId: string;
        branch: string;
        version: string;
        buildVersion: string;
        engineVersion: string;
        riotClientVersion: string;
        riotClientBuild: string;
        buildDate: string | Date;
    }

    type ValorantSkin = {
        name: string;
        uuid: string;
        level: {
            names: string[];
            embeds: KEmbed[];
            components: ActionRowBuilder<MessageActionRowComponentBuilder>;
            videos: string[];
        };
        chroma: {
            names: string[];
            embeds: KEmbed[];
            components: ActionRowBuilder<MessageActionRowComponentBuilder>;
            videos: string[];
        };
    };

    type ValorantSkinCollection = Collection<string, ValorantSkin>;

    interface IValorantAccount {
        username: string;
        user: User;
        auth: WebClient;
        player: ValorantPlayerInfo;
        trackerURL?: string;
    }

    type PrivacyTypes = "public" | "friends" | "private";

    type ValorantBundleItem = {
        Item: {
            ItemTypeID: string;
            ItemID: string;
            Amount: number;
        };
        BasePrice: number;
        CurrencyID: string;
        DiscountPercent: number;
        DiscountedPrice: number;
        IsPromoItem: boolean;
    };

    type ValorantAccessoryItem = {
        Offer: {
            OfferID: string;
            isDirectPurchase: boolean;
            StartDate: string;
            Cost: Record<string, number>;
            Rewards: {
                ItemTypeID: string;
                ItemID: string;
                Quantity: number;
            }[];
        };
        ContractID: string;
    };

    interface IValorantPlayerInfo {
        country: string;
        sub: string;
        email_verified: boolean;
        player_plocale: string;
        country_at: string | null;
        pw: {
            cng_at: number;
            reset: boolean;
            must_reset: boolean;
        };
        phone_number_verified: boolean;
        account_verified: boolean;
        ppid: string | null;
        federated_identity_providers: string[];
        player_locale: "en";
        acct: {
            type: number;
            state: string;
            adm: boolean;
            game_name: string;
            tag_line: string;
            created_at: number;
        };
        age: number;
        jti: string;
        affinity: {
            pp: string;
        };
    }

    // End of Valorant Declarations

    interface IMetadata {
        interaction:
            | ChatInputCommandInteraction<"cached">
            | ContextMenuCommandInteraction<"cached">;
        channel: TextChannel | VoiceChannel;
    }

    type IWarn = {
        id: string;
        guildId: string;
        by: string;
        reason: string;
        createdTimestamp: number;
        createdAt: Date;
    };

    type IInvite = {
        code: string;
        memberId: string;
        url: string;
        uses: number | null;
        expiresTimestamp: number | null;
        maxAge: number | null;
        maxUses: number | null;
    };

    type StaffType =
        | "lead_developer"
        | "developer"
        | "designer"
        | "bug_tester"
        | "translator";

    type CardType = "buffer" | "attachment";

    // Shinobi Types
    interface IShinobiClan {
        id: string;
        name: string;
        description: string;
        members: number;
        icon: string;
        stats: ShinobiStats;
    }

    interface IShinobiVillage {
        id: string;
        name: {
            en: string;
            jp: string;
        };
        description: string;
        population: number;
        icon: string;
    }

    interface IShinobiStats {
        hp: number;
        chakra: number;
        ninjutsu: number;
        genjutsu: number;
        taijutsu: number;
        kenjutsu: number;
    }

    interface ICurrencies {
        ryo: number;
    }

    interface IShinobiWeapon {
        id: string;
        name: string;
        icon: string;
        attack: number;
        cost: number;
    }

    type ShinobiRanks =
        | "genin"
        | "chunin"
        | "jonin"
        | "special_jonin"
        | "hokage"
        | "anbu"
        | "medical"
        | "rogue";
}

declare module "discord.js" {
    // Below is needed to not mess with discord.js module
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export interface Guild {
        musicMessage: Message | null | undefined;
    }
}
