import { container } from "@sapphire/pieces";
import Auth from "@valapi/auth";
import WebClient from "@valapi/web-client";
import { Collection, type Snowflake } from "discord.js";
import ms from "ms";
import type { ValorantAccount } from "typings/Valorant";
import {
    ValorantAgents,
    ValorantBuddies,
    ValorantBundles,
    ValorantCeremonies,
    ValorantCompetitiveSeasons,
    ValorantCompetitiveTiers,
    ValorantContentTiers,
    ValorantContracts,
    ValorantCurrencies,
    ValorantEvents,
    ValorantGamemodes,
    ValorantLevelBorders,
    ValorantMaps,
    ValorantMissions,
    ValorantObjectives,
    ValorantPlayerCards,
    ValorantPlayerTitles,
    ValorantSeasons,
    ValorantSkins,
    ValorantSprays,
    ValorantThemes,
    ValorantVersions,
    ValorantWeapons,
} from "./assets";
import ValorantAuth from "./Auth";
import ValorantUtil from "./Util";

export default class Valorant {
    initialized = false;

    util: ValorantUtil;

    // Information Assets
    agents: ValorantAgents;
    ceremonies: ValorantCeremonies;
    competitiveTiers: ValorantCompetitiveTiers;
    competitiveSeasons: ValorantCompetitiveSeasons;
    contentTiers: ValorantContentTiers;
    contracts: ValorantContracts;
    currencies: ValorantCurrencies;
    events: ValorantEvents;
    gamemodes: ValorantGamemodes;
    maps: ValorantMaps;
    missions: ValorantMissions;
    objectives: ValorantObjectives;
    seasons: ValorantSeasons;
    themes: ValorantThemes;
    weapons: ValorantWeapons;

    // Cosmetic Assets
    buddies: ValorantBuddies;
    bundles: ValorantBundles;
    levelBorders: ValorantLevelBorders;
    playerCards: ValorantPlayerCards;
    playerTitles: ValorantPlayerTitles;
    skins: ValorantSkins;
    sprays: ValorantSprays;

    version?: ValorantVersions;

    // Authentication
    readonly auth: ValorantAuth;
    readonly accounts = new Collection<
        string,
        Collection<string, ValorantAccount>
    >();

    static readonly trackerURL = (gameName: string, tagLine: string) =>
        `https://tracker.gg/valorant/profile/riot/${gameName}%23${tagLine}`;

    static readonly assetsURL = "https://valorant-api.com/v1";

    constructor() {
        this.util = new ValorantUtil();

        this.agents = new ValorantAgents([]);
        this.ceremonies = new ValorantCeremonies([]);
        this.competitiveTiers = new ValorantCompetitiveTiers([]);
        this.competitiveSeasons = new ValorantCompetitiveSeasons([]);
        this.contentTiers = new ValorantContentTiers([]);
        this.contracts = new ValorantContracts([]);
        this.currencies = new ValorantCurrencies([]);
        this.events = new ValorantEvents([]);
        this.gamemodes = new ValorantGamemodes([]);
        this.maps = new ValorantMaps([]);
        this.missions = new ValorantMissions([]);
        this.objectives = new ValorantObjectives([]);
        this.seasons = new ValorantSeasons([]);
        this.themes = new ValorantThemes([]);
        this.weapons = new ValorantWeapons([]);

        this.buddies = new ValorantBuddies([]);
        this.bundles = new ValorantBundles([]);
        this.levelBorders = new ValorantLevelBorders([]);
        this.playerCards = new ValorantPlayerCards([]);
        this.playerTitles = new ValorantPlayerTitles([]);
        this.skins = new ValorantSkins([]);
        this.sprays = new ValorantSprays([]);

        this.auth = new ValorantAuth();
    }

    async init() {
        const { logger } = container.client;

        if (this.initialized) {
            logger.info("[Valorant] Already Initialized!");
            return;
        }

        const startTime = Date.now();
        logger.info("[Valorant] Initializing...");

        try {
            logger.info("[Valorant] Initializing Information...");

            logger.debug("[Valorant] Initializing Agents...");
            this.agents = await ValorantAgents.init();
            logger.debug("[Valorant] Agents: " + this.agents.all.length);
            logger.debug(`[Valorant] Initialized Agents`);

            logger.debug("[Valorant] Initializing Ceremonies...");
            this.ceremonies = await ValorantCeremonies.init();
            logger.debug(
                "[Valorant] Ceremonies: " + this.ceremonies.all.length,
            );
            logger.debug(`[Valorant] Initialized Ceremonies`);

            logger.debug("[Valorant] Initializing Competitive Tiers...");
            this.competitiveTiers = await ValorantCompetitiveTiers.init();
            logger.debug(
                "[Valorant] Competitive Tiers: " +
                    this.competitiveTiers.all.length,
            );
            logger.debug(`[Valorant] Initialized Competitive Tiers`);

            logger.debug("[Valorant] Initializing Competitive Seasons...");
            this.competitiveSeasons = await ValorantCompetitiveSeasons.init();
            logger.debug(
                "[Valorant] Competitive Seasons: " +
                    this.competitiveSeasons.all.length,
            );
            logger.debug(`[Valorant] Initialized Competitive Seasons`);

            logger.debug("[Valorant] Initializing Content Tiers...");
            this.contentTiers = await ValorantContentTiers.init();
            logger.debug(
                "[Valorant] Content Tiers: " + this.contentTiers.all.length,
            );
            logger.debug(`[Valorant] Initialized Content Tiers`);

            logger.debug("[Valorant] Initializing Contracts...");
            this.contracts = await ValorantContracts.init();
            logger.debug("[Valorant] Contracts: " + this.contracts.all.length);
            logger.debug(`[Valorant] Initialized Contracts`);

            logger.debug("[Valorant] Initializing Currencies...");
            this.currencies = await ValorantCurrencies.init();
            logger.debug(
                "[Valorant] Currencies: " + this.currencies.all.length,
            );
            logger.debug(`[Valorant] Initialized Currencies`);

            logger.debug("[Valorant] Initializing Events...");
            this.events = await ValorantEvents.init();
            logger.debug("[Valorant] Events: " + this.events.all.length);
            logger.debug(`[Valorant] Initialized Events`);

            logger.debug("[Valorant] Initializing Gamemodes...");
            this.gamemodes = await ValorantGamemodes.init();
            logger.debug("[Valorant] Gamemodes: " + this.gamemodes.all.length);
            logger.debug(`[Valorant] Initialized Gamemodes`);

            logger.debug("[Valorant] Initializing Maps...");
            this.maps = await ValorantMaps.init();
            logger.debug("[Valorant] Maps: " + this.maps.all.length);
            logger.debug(`[Valorant] Initialized Maps`);

            logger.debug("[Valorant] Initializing Missions...");
            this.missions = await ValorantMissions.init();
            logger.debug("[Valorant] Missions: " + this.missions.all.length);
            logger.debug(`[Valorant] Initialized Missions`);

            logger.debug("[Valorant] Initializing Objectives...");
            this.objectives = await ValorantObjectives.init();
            logger.debug(
                "[Valorant] Objectives: " + this.objectives.all.length,
            );
            logger.debug(`[Valorant] Initialized Objectives`);

            logger.debug("[Valorant] Initializing Seasons...");
            this.seasons = await ValorantSeasons.init();
            logger.debug("[Valorant] Seasons: " + this.seasons.all.length);
            logger.debug(`[Valorant] Initialized Seasons`);

            logger.debug("[Valorant] Initializing Themes...");
            this.themes = await ValorantThemes.init();
            logger.debug("[Valorant] Themes: " + this.themes.all.length);
            logger.debug(`[Valorant] Initialized Themes`);

            logger.debug("[Valorant] Initializing Weapons...");
            this.weapons = await ValorantWeapons.init();
            logger.debug("[Valorant] Weapons: " + this.weapons.all.length);
            logger.debug(`[Valorant] Initialized Weapons`);

            logger.debug("[Valorant] Initializing Version...");
            this.version = await ValorantVersions.init();
            logger.debug(`[Valorant] Initialized Version`);

            logger.info("[Valorant] Initialized Information");

            logger.info("[Valorant] Initializing Cosmetics...");

            logger.debug("[Valorant] Initializing Buddies...");
            this.buddies = await ValorantBuddies.init();
            logger.debug("[Valorant] Buddies: " + this.buddies.all.length);
            logger.debug("[Valorant] Initialized Buddies");

            logger.debug("[Valorant] Initializing Bundles...");
            this.bundles = await ValorantBundles.init();
            logger.debug("[Valorant] Bundles: " + this.bundles.all.length);
            logger.debug("[Valorant] Initialized Bundles");

            logger.debug("[Valorant] Initializing Level Borders...");
            this.levelBorders = await ValorantLevelBorders.init();
            logger.debug(
                "[Valorant] Level Borders: " + this.levelBorders.all.length,
            );
            logger.debug("[Valorant] Initialized Level Borders");

            logger.debug("[Valorant] Initializing Player Cards...");
            this.playerCards = await ValorantPlayerCards.init();
            logger.debug(
                "[Valorant] Player Cards: " + this.playerCards.all.length,
            );
            logger.debug("[Valorant] Initialized Player Cards");

            logger.debug("[Valorant] Initializing Player Titles...");
            this.playerTitles = await ValorantPlayerTitles.init();
            logger.debug(
                "[Valorant] Player Titles: " + this.playerTitles.all.length,
            );
            logger.debug("[Valorant] Initialized Player Titles");

            logger.debug("[Valorant] Initializing Skins...");
            this.skins = await ValorantSkins.init();
            logger.debug("[Valorant] Skins: " + this.skins.all.length);
            logger.debug("[Valorant] Initialized Skins");

            logger.debug("[Valorant] Initializing Sprays...");
            this.sprays = await ValorantSprays.init();
            logger.debug("[Valorant] Sprays: " + this.sprays.all.length);
            logger.debug("[Valorant] Initialized Sprays");

            logger.info("[Valorant] Initialized Cosmetics");
        } catch (err) {
            logger.error(err);
        }

        this.initialized = true;

        logger.info(`[Valorant] Initialized in ${ms(Date.now() - startTime)}`);
    }

    async loadAccounts(userId: Snowflake) {
        const { logger, managers, users } = container.client;

        const dbUser = await managers.users.get(userId);
        const user =
            users.cache.get(userId) ??
            (await users.fetch(userId).catch(() => null));

        if (!user) {
            logger.debug(`[Valorant] User not found for ${userId}`);
            return;
        }

        const { valorant } = dbUser;

        let accounts = this.accounts.get(userId);
        if (!accounts) {
            this.accounts.set(userId, new Collection());
            accounts = this.accounts.get(userId);
        }

        if (!valorant || valorant.accounts.length === 0) {
            logger.debug(
                `[Valorant] No accounts found for ${user.displayName}`,
            );
            return;
        }

        if (!accounts) {
            logger.debug(
                `[Valorant] ${user.displayName} failed to create accounts collection`,
            );
            return;
        }

        let deletedCount = 0;
        let allAccounts = 0;

        for (const account of valorant.accounts) {
            if (accounts.has(account.username)) continue;
            allAccounts++;

            const auth = new Auth({ user: account.json });

            if (!auth.isAuthenticated) {
                const reauthResult = await auth
                    .reauthorize()
                    .then(() => {
                        logger.debug(
                            `[Valorant] Reauthorized ${account.username} - ${user.displayName}`,
                        );

                        return true;
                    })
                    .catch((err) => {
                        logger.error(
                            `[Valorant] Failed to reauthorize ${account.username} - ${user.displayName} - Removing account`,
                        );
                        logger.error(err);

                        return false;
                    });

                if (!reauthResult) {
                    accounts.delete(account.username);
                    valorant.accounts = valorant.accounts.filter(
                        (acc) => acc.username !== account.username,
                    );
                    await dbUser.save();
                    deletedCount++;
                    continue;
                }
            }

            const webClient = new WebClient({
                user: auth.toJSON(),
                region: await auth.regionTokenization(),
            });

            const playerInfo = (
                await webClient.getUserInfo().catch((err) => {
                    logger.error(
                        `[Valorant] Failed to get user info for ${account.username} - ${user.displayName}`,
                    );
                    logger.error(err);
                    return null;
                })
            )?.data;

            if (!playerInfo) {
                accounts.delete(account.username);
                valorant.accounts = valorant.accounts.filter(
                    (acc) => acc.username !== account.username,
                );
                await dbUser.save();
                deletedCount++;
                continue;
            }

            accounts.set(account.username, {
                username: account.username,
                user,
                auth,
                web: webClient,
                player: playerInfo,
                trackerURL: Valorant.trackerURL(
                    playerInfo.acct.game_name,
                    playerInfo.acct.tag_line,
                ),
            });

            logger.debug(
                `[Valorant] Loaded ${account.username} - ${user.displayName}`,
            );
        }

        logger.info(
            `[Valorant] Loaded ${allAccounts} accounts for ${user.displayName} - Deleted ${deletedCount}`,
        );

        return allAccounts === deletedCount;
    }
}
