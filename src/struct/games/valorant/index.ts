import { container } from "@sapphire/pieces";

import {
    Agents,
    Buddies,
    Bundles,
    Ceremonies,
    CompetitiveSeasons,
    CompetitiveTiers,
    ContentTiers,
    Contracts,
    Currencies,
    Events,
    Gamemodes,
    Gear,
    LevelBorders,
    Maps,
    Missions,
    Objectives,
    PlayerCards,
    PlayerTitles,
    Seasons,
    Skins,
    Sprays,
    Themes,
    Weapons,
    Version,
} from "./assets";
import {
    ChatInputCommandInteraction,
    Collection,
    type Snowflake,
} from "discord.js";
import { WebClient } from "valorant.ts";

import ValorantAuth from "./Auth";
import ValorantShop from "./Shop";
import ValorantUtil from "./Util";
import _ from "lodash";

export default class Valorant {
    readonly accounts: Collection<string, Collection<string, ValorantAccount>> =
        new Collection();

    initialized: boolean = false;

    readonly auth: ValorantAuth;

    agents: Agents;
    buddies: Buddies;
    bundles: Bundles;
    ceremonies: Ceremonies;
    competitiveTiers: CompetitiveTiers;
    competitiveSeasons: CompetitiveSeasons;
    contentTiers: ContentTiers;
    contracts: Contracts;
    currencies: Currencies;
    events: Events;
    gamemodes: Gamemodes;
    skins: Skins;
    gear: Gear;
    levelBorders: LevelBorders;
    maps: Maps;
    missions: Missions;
    objectives: Objectives;
    playerCards: PlayerCards;
    playerTitles: PlayerTitles;
    seasons: Seasons;
    sprays: Sprays;
    themes: Themes;
    weapons: Weapons;
    version?: Version;
    readonly shop: ValorantShop;
    readonly util: ValorantUtil;
    static readonly trackerURL: string =
        "https://tracker.gg/valorant/profile/riot/%username%";

    static readonly assetsURL: string = "https://valorant-api.com/v1";

    constructor() {
        this.auth = new ValorantAuth(this);

        this.agents = new Agents([]);
        this.buddies = new Buddies([]);
        this.bundles = new Bundles([]);
        this.ceremonies = new Ceremonies([]);
        this.competitiveTiers = new CompetitiveTiers([]);
        this.competitiveSeasons = new CompetitiveSeasons([]);
        this.contentTiers = new ContentTiers([]);
        this.contracts = new Contracts([]);
        this.currencies = new Currencies([]);
        this.events = new Events([]);
        this.gamemodes = new Gamemodes([]);
        this.skins = new Skins([]);
        this.gear = new Gear([]);
        this.levelBorders = new LevelBorders([]);
        this.maps = new Maps([]);
        this.missions = new Missions([]);
        this.objectives = new Objectives([]);
        this.playerCards = new PlayerCards([]);
        this.playerTitles = new PlayerTitles([]);
        this.seasons = new Seasons([]);
        this.sprays = new Sprays([]);
        this.themes = new Themes([]);
        this.weapons = new Weapons([]);

        this.shop = new ValorantShop(this);
        this.util = new ValorantUtil(this);
    }

    async init() {
        const { logger } = container;

        if (this.initialized) {
            logger.debug("[Valorant] Already initialized");
            return;
        }

        logger.info("[Valorant] Initializing...");

        //const assets = new ValorantApiCom();

        try {
            logger.debug("[Valorant] Fetching assets");

            logger.debug("[Valorant] Fetching agents");

            this.agents = await Agents.fetch();

            logger.debug("[Valorant] Agents fetched");

            logger.debug("[Valorant] Fetching buddies");

            this.buddies = await Buddies.fetch();

            logger.debug("[Valorant] Buddies fetched");

            this.bundles = await Bundles.fetch();

            logger.debug("[Valorant] Bundles fetched");

            logger.debug("[Valorant] Fetching ceremonies");

            this.ceremonies = await Ceremonies.fetch();

            logger.debug("[Valorant] Ceremonies fetched");

            logger.debug("[Valorant] Fetching competitive tiers");

            this.competitiveTiers = await CompetitiveTiers.fetch();

            logger.debug("[Valorant] Competitive tiers fetched");

            this.competitiveSeasons = await CompetitiveSeasons.fetch();

            logger.debug("[Valorant] Competitive seasons fetched");

            logger.debug("[Valorant] Fetching content tiers");

            this.contentTiers = await ContentTiers.fetch();

            logger.debug("[Valorant] Content tiers fetched");

            logger.debug("[Valorant] Fetching contracts");

            this.contracts = await Contracts.fetch();

            logger.debug("[Valorant] Contracts fetched");

            logger.debug("[Valorant] Fetching currencies");

            this.currencies = await Currencies.fetch();

            logger.debug("[Valorant] Currencies fetched");

            logger.debug("[Valorant] Fetching events");

            this.events = await Events.fetch();

            logger.debug("[Valorant] Events fetched");

            logger.debug("[Valorant] Fetching gamemodes");

            this.gamemodes = await Gamemodes.fetch();

            logger.debug("[Valorant] Gamemodes fetched");

            logger.debug("[Valorant] Fetching skins");

            this.skins = await Skins.fetch();

            logger.debug("[Valorant] Skins fetched");

            logger.debug("[Valorant] Fetching gear");

            this.gear = await Gear.fetch();

            logger.debug("[Valorant] Gear fetched");

            logger.debug("[Valorant] Fetching level borders");

            this.levelBorders = await LevelBorders.fetch();

            logger.debug("[Valorant] Level borders fetched");

            logger.debug("[Valorant] Fetching maps");

            this.maps = await Maps.fetch();

            logger.debug("[Valorant] Maps fetched");

            logger.debug("[Valorant] Fetching missions");

            this.missions = await Missions.fetch();

            logger.debug("[Valorant] Missions fetched");

            logger.debug("[Valorant] Fetching objectives");

            this.objectives = await Objectives.fetch();

            logger.debug("[Valorant] Objectives fetched");

            logger.debug("[Valorant] Fetching player cards");

            this.playerCards = await PlayerCards.fetch();

            logger.debug("[Valorant] Player cards fetched");

            this.playerTitles = await PlayerTitles.fetch();

            logger.debug("[Valorant] Player titles fetched");

            logger.debug("[Valorant] Fetching seasons");

            this.seasons = await Seasons.fetch();

            logger.debug("[Valorant] Seasons fetched");

            logger.debug("[Valorant] Fetching sprays");

            this.sprays = await Sprays.fetch();

            logger.debug("[Valorant] Sprays fetched");

            logger.debug("[Valorant] Fetching themes");

            this.themes = await Themes.fetch();

            logger.debug("[Valorant] Themes fetched");

            logger.debug("[Valorant] Fetching weapons");

            this.weapons = await Weapons.fetch();

            logger.debug("[Valorant] Weapons fetched");

            logger.debug("[Valorant] Fetching version");

            this.version = await Version.fetch();

            logger.debug("[Valorant] Version fetched");
        } catch (err) {
            logger.error(err);
        }

        this.initialized = true;

        logger.info("[Valorant] Initialized!");
    }

    async privacy(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction;

        const accounts = this.accounts.get(user.id);
        if (!accounts) return;

        const { database } = container;
        const db = await database.users.fetch(user.id);

        const privacy = options.getString("valorant_privacy_setting", true);

        const { valorant } = db;

        if (!Object.keys(valorant.privacy).includes(privacy))
            return interaction.reply({
                content: "**😲 This privacy setting does not exist!**",
                ephemeral: true,
            });

        valorant.privacy[privacy as keyof typeof valorant.privacy] =
            options.getString("valorant_privacy_value", true) as PrivacyTypes;

        db.markModified("valorant.privacy");
        await db.save();

        await interaction.reply({
            content: `**😎 Successfully set the privacy setting \`${_.capitalize(
                privacy
            )}\` to \`${_.capitalize(
                valorant.privacy[privacy as keyof typeof valorant.privacy]
            )}\`**`,
            ephemeral: true,
        });
    }

    async loadAccounts(userId: Snowflake) {
        const { database, logger } = container;

        const user = await container.client.users.fetch(userId);

        const db = await database.users.fetch(user.id);
        const { valorant } = db;

        let accounts = this.accounts.get(user.id);

        if (!accounts) {
            this.accounts.set(user.id, new Collection());
            accounts = this.accounts.get(user.id);
        }

        if (!valorant || valorant.accounts.length === 0) {
            logger.debug(
                `[Valorant] ${user.username} has no valorant accounts linked to the database`
            );
            return;
        }

        if (!accounts) {
            logger.debug(
                `[Valorant] ${user.username} failed to create accounts collection`
            );
            return;
        }

        let deletedCount = 0;
        let allAccounts = 0;

        for (const account of valorant.accounts) {
            if (accounts.has(account.username)) continue;
            allAccounts++;

            const web = WebClient.fromJSON(account.json, {
                version: this.version?.riotClient,
            });

            const refreshResult = await web
                .refresh()
                .then(() => true)
                .catch((err) => {
                    logger.error(err);
                    logger.error(
                        `[Valorant] Failed to refresh the account for Player ${account.username}. Removing the account from the database`
                    );
                    return false;
                });

            if (!refreshResult) {
                accounts.delete(account.username);
                db.valorant.accounts = db.valorant.accounts.filter(
                    (acc) => acc.username !== account.username
                );
                await db.save();
                deletedCount++;
                continue;
            }

            const playerInfo: ValorantPlayerInfo | null = (
                await web.getUserInfo().catch((err) => {
                    logger.error(err);
                    logger.error(
                        `[Valorant] Failed to get Valorant Player Info for ${account.username}. Removing the account from the database`
                    );
                    return null;
                })
            )?.data;

            if (!playerInfo) {
                accounts.delete(account.username);
                db.valorant.accounts = db.valorant.accounts.filter(
                    (acc) => acc.username !== account.username
                );
                await db.save();
                deletedCount++;
                continue;
            }

            accounts.set(account.username, {
                username: account.username,
                user,
                auth: web,
                player: playerInfo,
                trackerURL: Valorant.trackerURL.replaceAll(
                    "%username%",
                    `${playerInfo.acct.game_name}%23${playerInfo.acct.tag_line}`
                ),
            });

            logger.debug(
                `[Valorant] ${user.username} loaded ${account.username} for valorant`
            );

            return allAccounts === deletedCount;
        }
    }
}
