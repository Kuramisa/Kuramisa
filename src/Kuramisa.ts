import {
    APIApplicationCommand,
    ActivityType,
    Client,
    Collection,
    EmojiResolvable,
    Guild,
    Partials,
    PresenceData,
    Routes,
    TextChannel,
    User
} from "discord.js";
import logger from "struct/Logger";
import ms from "ms";

import dLogs from "discord-logs";

import Dashboard from "dashboard";

import Database from "@struct/database";
import Games from "@struct/games";
import Managers from "managers";
import Moderation from "@struct/moderation";
import Stores from "./stores";
import Systems from "@struct/systems";

import Kanvas from "@struct/kanvas";
import { staffName, weighStaffType } from "@utils";
import { merge } from "lodash";
import { inspect } from "node:util";

const { NODE_ENV, TOKEN } = process.env;

export default class Kuramisa extends Client {
    initialized = false;
    startTime = Date.now();

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
    bugReports?: TextChannel;
    suggestions?: TextChannel;
    promoteChannel?: TextChannel;

    // Staff Declarations
    staff: BotStaff[] = [];
    owners: User[] = [];

    // Kuramisa Colletions
    readonly cooldowns = new Collection<string, Collection<string, number>>();
    readonly kEmojis = new Collection<string, EmojiResolvable>();

    constructor() {
        super({
            intents: [
                "GuildBans",
                "GuildInvites",
                "Guilds",
                "GuildEmojisAndStickers",
                "GuildMessageReactions",
                "GuildMessagePolls",
                "GuildMessages",
                "GuildVoiceStates",
                "GuildIntegrations",
                "MessageContent",
                "GuildMembers",
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
        return super.login(TOKEN);
    }

    async updateRest() {
        const { rest, user: bot } = this;
        rest.setToken(this.token ?? TOKEN ?? "");
        if (!bot) return logger.error("[REST] Bot is not ready yet");

        const startTime = Date.now();
        logger.info("[REST] Updating Commands...");

        const commands = this.stores.commands.commands.map((cmd) =>
            cmd.data.toJSON()
        );

        try {
            let updatedCommands: APIApplicationCommand[] = [];
            if (NODE_ENV === "development") {
                updatedCommands = (await rest.put(
                    Routes.applicationGuildCommands(
                        bot.id,
                        "1110011068488613931"
                    ),
                    { body: commands }
                )) as APIApplicationCommand[];
            } else {
                const ownerCommands = this.stores.commands.commands
                    .filter((cmd) => cmd.ownerOnly)
                    .map((cmd) => cmd.data.toJSON());

                if (ownerCommands.length > 0) {
                    const updatedOwnerCommands = (await rest.put(
                        Routes.applicationGuildCommands(
                            bot.id,
                            "1110011068488613931"
                        ),
                        { body: ownerCommands }
                    )) as APIApplicationCommand[];

                    for (const command of updatedOwnerCommands) {
                        logger.debug(
                            `[REST] Updated Owner Command (${command.name})`
                        );
                    }

                    updatedCommands.push(...updatedOwnerCommands);
                }

                updatedCommands = (await rest.put(
                    Routes.applicationCommands(bot.id),
                    { body: commands }
                )) as APIApplicationCommand[];
            }

            for (const command of updatedCommands) {
                logger.debug(`[REST] Updated Command (${command.name})`);
            }

            logger.info(
                `[REST] Updated (${updatedCommands.length}) Commands in ${ms(Date.now() - startTime)}`
            );
        } catch (error: any) {
            logger.error(error.message, { error });
        }
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
        logger.info("[Staff System] Initializing Bot Staff...");

        const staffDbs = await this.database.users.fetchStaff();
        const staffs: BotStaff[] = [];

        for (const staffDb of staffDbs) {
            const user = await this.managers.users.get(staffDb.id);
            if (!user) continue;

            staffs.push(merge(user, staffDb._doc));

            logger.debug(
                `[Staff System] Initialized ${
                    user.username
                } as ${staffName(staffDb.type)}`
            );
        }

        logger.info(
            `[Staff System] Initialized ${staffs.length} staff members`
        );

        this.staff = staffs.sort(
            (a, b) => weighStaffType(b.type) - weighStaffType(a.type)
        );
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

        logger.info("[Bot] Cleared out empty dynamic voice channels");
    }

    async clean(text: any) {
        if (text && text.constructor.name === "Promise") text = await text;

        if (typeof text !== "string") text = inspect(text, { depth: 1 });

        text = text
            .replace(/`/g, "`" + String.fromCharCode(8203))
            .replace(/@/g, "@" + String.fromCharCode(8203));

        text = text.replaceAll(this.token, "[REDACTED]");

        return text;
    }
}
