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
} from "@struct/games/valorant/assets/index";
import { ValorantApiCom, Version } from "@valapi/valorant-api.com";
import { ChatInputCommandInteraction, Collection, User } from "discord.js";
import { WebClient } from "valorant.ts";

import ValorantAuth from "./Auth";
import ValorantShop from "./Shop";
import ValorantUtil from "./Util";
import type {
    PrivacyTypes,
    ValorantAccount,
    ValorantPlayerInfo,
} from "../../../@types";
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
    version?: Version.Version;
    readonly shop: ValorantShop;
    readonly util: ValorantUtil;
    readonly trackerURL: string =
        "https://tracker.gg/valorant/profile/riot/%username%";

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
        if (this.initialized) return;

        const { logger } = container;

        logger.info("[Valorant] Initializing...");

        const assets = new ValorantApiCom();

        try {
            logger.debug("[Valorant] Fetching assets");

            logger.debug("[Valorant] Fetching agents");

            this.agents = new Agents(
                (await assets.Agents.get()).data.data!.filter(
                    (a) => a.isPlayableCharacter
                )
            );

            logger.debug("[Valorant] Agents fetched");

            logger.debug("[Valorant] Fetching buddies");

            this.buddies = new Buddies((await assets.Buddies.get()).data.data!);

            logger.debug("[Valorant] Buddies fetched");

            this.bundles = new Bundles((await assets.Bundles.get()).data.data!);

            logger.debug("[Valorant] Bundles fetched");

            logger.debug("[Valorant] Fetching ceremonies");

            this.ceremonies = new Ceremonies(
                (await assets.Ceremonies.get()).data.data!
            );

            logger.debug("[Valorant] Ceremonies fetched");

            logger.debug("[Valorant] Fetching competitive tiers");

            this.competitiveTiers = new CompetitiveTiers(
                (await assets.CompetitiveTiers.get()).data.data!
            );

            logger.debug("[Valorant] Competitive tiers fetched");

            this.competitiveSeasons = new CompetitiveSeasons(
                (await assets.Seasons.getCompetitiveSeasons()).data.data!
            );

            logger.debug("[Valorant] Competitive seasons fetched");

            logger.debug("[Valorant] Fetching content tiers");

            this.contentTiers = new ContentTiers(
                (await assets.ContentTiers.get()).data.data!
            );

            logger.debug("[Valorant] Content tiers fetched");

            logger.debug("[Valorant] Fetching contracts");

            this.contracts = new Contracts(
                (await assets.Contracts.get()).data.data!
            );

            logger.debug("[Valorant] Contracts fetched");

            logger.debug("[Valorant] Fetching currencies");

            this.currencies = new Currencies(
                (await assets.Currencies.get()).data.data!
            );

            logger.debug("[Valorant] Currencies fetched");

            logger.debug("[Valorant] Fetching events");

            this.events = new Events((await assets.Events.get()).data.data!);

            logger.debug("[Valorant] Events fetched");

            logger.debug("[Valorant] Fetching gamemodes");

            this.gamemodes = new Gamemodes(
                (await assets.Gamemodes.get()).data.data!
            );

            logger.debug("[Valorant] Gamemodes fetched");

            logger.debug("[Valorant] Fetching skins");

            /*this.skins = new Skins(
                (await assets.Weapons.getSkins()).data.data!
            );*/

            logger.debug("[Valorant] Skins fetched");

            logger.debug("[Valorant] Fetching gear");

            this.gear = new Gear((await assets.Gear.get()).data.data!);

            logger.debug("[Valorant] Gear fetched");

            logger.debug("[Valorant] Fetching level borders");

            this.levelBorders = new LevelBorders(
                (await assets.LevelBorders.get()).data.data!
            );

            logger.debug("[Valorant] Level borders fetched");

            logger.debug("[Valorant] Fetching maps");

            this.maps = new Maps((await assets.Maps.get()).data.data!);

            logger.debug("[Valorant] Maps fetched");

            logger.debug("[Valorant] Fetching missions");

            this.missions = new Missions(
                (await assets.Missions.get()).data.data!
            );

            logger.debug("[Valorant] Missions fetched");

            logger.debug("[Valorant] Fetching objectives");

            this.objectives = new Objectives(
                (await assets.Objectives.get()).data.data!
            );

            logger.debug("[Valorant] Objectives fetched");

            logger.debug("[Valorant] Fetching player cards");

            /*this.playerCards = new PlayerCards(
                (await assets.PlayerCards.get()).data.data!
            );*/

            logger.debug("[Valorant] Player cards fetched");

            this.playerTitles = new PlayerTitles(
                (await assets.PlayerTitles.get()).data.data!
            );

            logger.debug("[Valorant] Player titles fetched");

            logger.debug("[Valorant] Fetching seasons");

            this.seasons = new Seasons((await assets.Seasons.get()).data.data!);

            logger.debug("[Valorant] Seasons fetched");

            logger.debug("[Valorant] Fetching sprays");

            this.sprays = new Sprays((await assets.Sprays.get()).data.data!);

            logger.debug("[Valorant] Sprays fetched");

            logger.debug("[Valorant] Fetching themes");

            this.themes = new Themes((await assets.Themes.get()).data.data!);

            logger.debug("[Valorant] Themes fetched");

            logger.debug("[Valorant] Fetching weapons");

            this.weapons = new Weapons((await assets.Weapons.get()).data.data!);

            logger.debug("[Valorant] Weapons fetched");

            logger.debug("[Valorant] Fetching version");

            this.version = (await assets.Version.get()).data.data!;

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

    async loadAccounts(user: User) {
        const { database, logger } = container;

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
                version: this.version?.version,
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
                trackerURL: this.trackerURL.replaceAll(
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
