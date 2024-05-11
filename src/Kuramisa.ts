import {
    APIApplicationCommand,
    ActivityType,
    Client,
    Collection,
    Guild,
    Partials,
    PresenceData,
    Routes,
    TextChannel,
    User
} from "discord.js";
import logger from "struct/Logger";

import dLogs from "discord-logs";

import Dashboard from "dashboard";

import Database from "@struct/database";
import Games from "@struct/games";
import Managers from "managers";
import Moderation from "@struct/moderation";
import Stores from "./stores";
import Systems from "@struct/systems";

import Kanvas from "@struct/kanvas";
import { staffName } from "@utils";

const { CLIENT_ID, NODE_ENV, TOKEN } = process.env;

export default class Kuramisa extends Client {
    initialized = false;

    // Server Declarations
    mainServer?: Guild;

    // Dashboard Declarations
    readonly dashboard: Dashboard;

    // Class Declarations
    readonly database;
    readonly kanvas;
    readonly managers;
    readonly moderation;
    readonly games;
    readonly stores;
    readonly systems;

    // Logger
    readonly logger = logger;
    static readonly logger = logger;

    // Channel Declarations
    botLogs?: TextChannel;
    devReports?: TextChannel;
    devSuggestions?: TextChannel;
    promoteChannel?: TextChannel;

    // Staff Declarations
    staff: BotStaff[] = [];
    owners: User[] = [];

    // Kuramisa Colletions
    readonly cooldowns = new Collection<string, Collection<string, number>>();
    readonly kEmojis = new Collection<string, string>();

    constructor() {
        super({
            intents: [
                "GuildBans",
                "GuildInvites",
                "Guilds",
                "GuildEmojisAndStickers",
                "GuildMessageReactions",
                "GuildMembers",
                "GuildMessages",
                "GuildVoiceStates",
                "GuildPresences",
                "GuildIntegrations",
                "MessageContent",
                "DirectMessages"
            ],
            partials: [Partials.Channel, Partials.Message, Partials.User]
        });

        dLogs(this, {
            debug: NODE_ENV === "development"
        });

        this.dashboard = new Dashboard();

        this.database = new Database();
        this.kanvas = new Kanvas();
        this.managers = new Managers();
        this.moderation = new Moderation();
        this.games = new Games();
        this.stores = new Stores();
        this.systems = new Systems(this);

        logger.info("Starting Kuramisa...");

        this.login();
    }

    async login() {
        this.setMaxListeners(0);
        await this.database.connect();
        await this.stores.events.load();
        await this.stores.commands.load();
        await this.updateRest();
        return super.login(TOKEN);
    }

    async updateRest() {
        const { rest, user: bot } = this;
        rest.setToken(TOKEN ?? "");

        const botId = CLIENT_ID ?? bot?.id ?? "";
        const restCommands = (await rest.get(
            Routes.applicationCommands(botId)
        )) as APIApplicationCommand[];

        const { commands } = this.stores.commands;

        const startTime = Date.now();
        logger.debug("[REST] Updating Commands...");

        // find deleted commands and update rest
        for (const restCommand of restCommands) {
            const command = commands.get(restCommand.name);

            if (!command) {
                logger.debug(`[REST] Deleting (${restCommand.name})`);
                await rest.delete(
                    Routes.applicationCommand(botId, restCommand.id)
                );
            }
        }

        for (const command of commands.values()) {
            const commandData = command.data.toJSON();
            const restCommand = restCommands.find(
                (c) => c.name === commandData.name
            );

            if (!restCommand) {
                logger.debug(`[REST] Creating (${commandData.name})`);
                await rest.post(Routes.applicationCommands(botId), {
                    body: commandData
                });
            } else {
                // TODO: Add check for if command is equal later
                logger.debug(`[REST] Updating (${commandData.name})`);
                await rest.patch(
                    Routes.applicationCommand(botId, restCommand.id),
                    { body: commandData }
                );
            }
        }

        logger.debug(`[REST] Updated Commands in ${Date.now() - startTime}ms`);
    }

    getActivities(): PresenceData {
        const activities: PresenceData[] = [
            {
                status: "online",
                activities: [
                    {
                        name: "Custom Status",
                        state: "Pet fox",
                        type: ActivityType.Custom
                    }
                ]
            },
            {
                status: "online",
                activities: [
                    {
                        name: "Custom Status 2",
                        state: `Watching Over Approx. ${this.guilds.cache.size} servers`,
                        type: ActivityType.Custom
                    }
                ]
            },
            {
                status: "online",
                activities: [
                    {
                        name: "Custom Status 3",
                        state: `Watching Over Approx. ${this.users.cache.size} users`,
                        type: ActivityType.Custom
                    }
                ]
            }
        ];

        return activities[Math.floor(Math.random() * activities.length)];
    }

    async initStaff() {
        logger.info("[Staff System] Initializing staff...");

        const staffDbs = await this.database.users.fetchStaff();
        const staffs: BotStaff[] = [];

        for (const staffDb of staffDbs) {
            const user = await this.managers.users.get(staffDb.id);
            if (!user) continue;

            staffs.push({
                ...user,
                ...staffDb._doc
            });

            logger.info(
                `[Staff System] Initialized ${
                    user.username
                } as ${staffName(staffDb.type)}`
            );
        }

        logger.info(
            `[Staff System] Initialized ${staffs.length} staff members`
        );

        this.staff = staffs;
    }

    async clearEmptyDynamicChannels() {
        logger.info("[Bot] Clearing out empty dynamic voice channels...");

        const guilds = await this.database.guilds.fetchAll();

        for (const guild of guilds) {
            const { dvc } = guild;

            if (!dvc.length) return;

            const g = this.guilds.cache.get(guild.id);
            if (!g) return;

            const channels = g.channels.cache;

            const emptyChannels = dvc.filter(
                (channel) => !channels.has(channel.id)
            );

            if (!emptyChannels.length) return;

            guild.dvc = guild.dvc.filter(
                (channel) => !emptyChannels.find((ch) => ch.id === channel.id)
            );

            guild.markModified("dvc");
            await guild.save();
        }

        logger.info("Cleared out empty dynamic voice channels");
    }
}
