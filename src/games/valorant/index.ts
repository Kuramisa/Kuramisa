import logger from "Logger";
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
    ValorantVersion,
    ValorantWeapons,
} from "./assets";
import ms from "ms";
import ValorantGamemodes from "./assets/info/Gamemodes";
import ValorantUtil from "./Util";
import ValorantAuth from "./Auth";
import { Collection } from "discord.js";

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

    version?: ValorantVersion;

    // Authentication
    readonly auth: ValorantAuth;
    readonly accounts = new Collection<
        string,
        Collection<string, IValorantAccount>
    >();

    static readonly trackerURL = (username: string) =>
        `https://tracker.gg/valorant/profile/riot/${username}`;

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

        this.auth = new ValorantAuth(this);
    }

    async init() {
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
                "[Valorant] Ceremonies: " + this.ceremonies.all.length
            );
            logger.debug(`[Valorant] Initialized Ceremonies`);

            logger.debug("[Valorant] Initializing Competitive Tiers...");
            this.competitiveTiers = await ValorantCompetitiveTiers.init();
            logger.debug(
                "[Valorant] Competitive Tiers: " +
                    this.competitiveTiers.all.length
            );
            logger.debug(`[Valorant] Initialized Competitive Tiers`);

            logger.debug("[Valorant] Initializing Competitive Seasons...");
            this.competitiveSeasons = await ValorantCompetitiveSeasons.init();
            logger.debug(
                "[Valorant] Competitive Seasons: " +
                    this.competitiveSeasons.all.length
            );
            logger.debug(`[Valorant] Initialized Competitive Seasons`);

            logger.debug("[Valorant] Initializing Content Tiers...");
            this.contentTiers = await ValorantContentTiers.init();
            logger.debug(
                "[Valorant] Content Tiers: " + this.contentTiers.all.length
            );
            logger.debug(`[Valorant] Initialized Content Tiers`);

            logger.debug("[Valorant] Initializing Contracts...");
            this.contracts = await ValorantContracts.init();
            logger.debug("[Valorant] Contracts: " + this.contracts.all.length);
            logger.debug(`[Valorant] Initialized Contracts`);

            logger.debug("[Valorant] Initializing Currencies...");
            this.currencies = await ValorantCurrencies.init();
            logger.debug(
                "[Valorant] Currencies: " + this.currencies.all.length
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
                "[Valorant] Objectives: " + this.objectives.all.length
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
            this.version = await ValorantVersion.init();
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
                "[Valorant] Level Borders: " + this.levelBorders.all.length
            );
            logger.debug("[Valorant] Initialized Level Borders");

            logger.debug("[Valorant] Initializing Player Cards...");
            this.playerCards = await ValorantPlayerCards.init();
            logger.debug(
                "[Valorant] Player Cards: " + this.playerCards.all.length
            );
            logger.debug("[Valorant] Initialized Player Cards");

            logger.debug("[Valorant] Initializing Player Titles...");
            this.playerTitles = await ValorantPlayerTitles.init();
            logger.debug(
                "[Valorant] Player Titles: " + this.playerTitles.all.length
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
}
