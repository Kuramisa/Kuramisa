import kuramisa from "@kuramisa";

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
    Version
} from "./assets";
import {
    type ChatInputCommandInteraction,
    Collection,
    ComponentType,
    type Snowflake
} from "discord.js";
import { WebClient } from "valorant.ts";

import ValorantAuth from "./Auth";
import ValorantShop from "./Shop";
import ValorantUtil from "./Util";
import ValorantWishlist from "./Wishlist";

import { capitalize } from "lodash";
import ms from "ms";

export default class Valorant {
    readonly accounts: Collection<
        string,
        Collection<string, IValorantAccount>
    > = new Collection();

    initialized: boolean = false;

    readonly auth: ValorantAuth;
    readonly shop: ValorantShop;
    readonly util: ValorantUtil;
    readonly wishlist: ValorantWishlist;

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
    static readonly trackerURL: string =
        "https://tracker.gg/valorant/profile/riot/%username%";

    static readonly assetsURL: string = "https://valorant-api.com/v1";

    constructor() {
        this.auth = new ValorantAuth(this);
        this.shop = new ValorantShop(this);
        this.util = new ValorantUtil(this);
        this.wishlist = new ValorantWishlist(this);

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
    }

    async init() {
        const { logger } = kuramisa;

        if (this.initialized) {
            logger.debug("[Valorant] Already initialized");
            return;
        }

        const startTime = Date.now();
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

        logger.info(`[Valorant] Initialized in ${ms(Date.now() - startTime)}`);
    }

    async privacy(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction;

        const accounts = this.accounts.get(user.id);
        if (!accounts) return;

        const { database } = kuramisa;
        const db = await database.users.fetch(user.id);

        const privacy = options.getString("valorant_privacy_setting", true);

        const { valorant } = db;

        if (!Object.keys(valorant.privacy).includes(privacy))
            return interaction.reply({
                content: "**😲 This privacy setting does not exist!**",
                ephemeral: true
            });

        valorant.privacy[privacy as keyof typeof valorant.privacy] =
            options.getString("valorant_privacy_value", true) as PrivacyTypes;

        db.markModified("valorant.privacy");
        await db.save();

        await interaction.reply({
            content: `**😎 Successfully set the privacy setting \`${capitalize(
                privacy
            )}\` to \`${capitalize(
                valorant.privacy[privacy as keyof typeof valorant.privacy]
            )}\`**`,
            ephemeral: true
        });
    }

    async loadAccounts(userId: Snowflake) {
        const { database, managers, logger } = kuramisa;

        const user = await managers.users.fetch(userId);

        const db = await database.users.fetch(user.id);
        const { valorant } = user;

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
                version: this.version?.riotClient
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

            const playerInfo = (
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
                )
            });

            logger.debug(
                `[Valorant] ${user.username} loaded ${account.username} for valorant`
            );
        }

        return allAccounts === deletedCount;
    }

    async agentsCommand(interaction: ChatInputCommandInteraction) {
        const { options } = interaction;

        const agentId = options.getString("valorant_agent_name", true);
        const agent = this.agents.getByID(agentId);
        if (!agent)
            return interaction.reply({
                content: "**😲 Agent not found!**",
                ephemeral: true
            });
        const agentEmbed = this.agents.embed(agent);
        return interaction.reply({
            embeds: [agentEmbed]
        });
    }

    async skinsCommand(interaction: ChatInputCommandInteraction) {
        const { options } = interaction;

        const weaponId = options.getString("valorant_weapon_name", true);
        const weapon = this.weapons.getByID(weaponId);
        if (!weapon)
            return interaction.reply({
                content: "**😲 Weapon not found!**",
                ephemeral: true
            });

        const skins = weapon.skins
            .filter((skin) => skin.contentTierUuid)
            .sort((a, b) => a.displayName.localeCompare(b.displayName));

        await interaction.deferReply();

        const infoCollection = this.skins.collection(skins);

        let page = 0;
        let levelPage = 0;

        const skin = infoCollection.at(page);
        if (!skin) return;

        const message = await interaction.editReply({
            embeds: [skin.level.embeds[0]],
            components: this.util.determineComponents(skin, true)
        });

        const buttonNames = ["previous_skin", "next_skin", "add_to_wishlist"];

        const buttonCollector = message.createMessageComponentCollector({
            filter: (i) =>
                i.user.id === interaction.user.id &&
                (buttonNames.includes(i.customId) ||
                    i.customId.includes("valorant_skin_chroma")),
            componentType: ComponentType.Button
        });

        const menuCollector = message.createMessageComponentCollector({
            filter: (i) =>
                i.user.id === interaction.user.id &&
                i.customId === "valorant_weapon_skin_level_select",
            componentType: ComponentType.StringSelect
        });

        buttonCollector.on("collect", async (i) => {
            switch (i.customId) {
                case "previous_skin": {
                    page = page > 0 ? --page : infoCollection.size;
                    levelPage = 0;
                    break;
                }
                case "next_skin": {
                    page = page + 1 < infoCollection.size ? ++page : 0;
                    levelPage = 0;
                    break;
                }
                case "add_to_wishlist": {
                    await i.reply({
                        content: "**😁 Coming Soon™️!**",
                        ephemeral: true
                    });
                    return;
                }
            }

            if (i.customId.includes("valorant_skin_chroma")) {
                const skin = infoCollection.at(page);
                if (!skin) return;
                const chromaPage = parseInt(i.customId.split("_")[3]);
                if (isNaN(chromaPage)) return;

                await this.util.updateInfoChroma(i, skin, chromaPage, true);
                return;
            }

            const skin = infoCollection.at(page);
            if (!skin) return;

            await this.util.updateInfoLevel(i, skin, levelPage, true);
        });

        menuCollector.on("collect", async (i) => {
            levelPage = parseInt(i.values[0]);
            const skin = infoCollection.at(page);
            if (!skin) return;
            await this.util.updateInfoLevel(i, skin, levelPage, true);
        });
    }

    async skinCommand(interaction: ChatInputCommandInteraction) {
        const { options } = interaction;

        const skinId = options.getString("valorant_skin_name", true);
        const skin = this.skins.getByID(skinId);
        if (!skin)
            return interaction.reply({
                content: "**😲 Skin not found!**",
                ephemeral: true
            });
        const skinInfo = this.skins.info(skin);
        await this.util.createSkinCollectors(interaction, skinInfo);
    }

    async weaponsCommand(interaction: ChatInputCommandInteraction) {
        const { options } = interaction;

        const weaponId = options.getString("valorant_weapon_name", true);
        const weapon = this.weapons.getByID(weaponId);
        if (!weapon)
            return interaction.reply({
                content: "**😲 Weapon not found!**",
                ephemeral: true
            });
        const weaponEmbed = this.weapons.embed(weapon);
        const weaponRow = this.weapons.row(weapon);
        return interaction.reply({
            embeds: [weaponEmbed],
            components: [weaponRow]
        });
    }
}
