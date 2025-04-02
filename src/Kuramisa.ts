import "@sapphire/plugin-logger/register";

import { pickRandom } from "@sapphire/utilities";
import dLogs from "discord-logs";
import type { ApplicationEmoji } from "discord.js";
import {
    ActivityType,
    Collection,
    Partials,
    type PresenceData,
    type User,
} from "discord.js";

import { LogLevel, SapphireClient } from "@sapphire/framework";

import { getRootData } from "@sapphire/pieces";
import path from "path";
import Database from "./database";
import Games from "./games";
import Kanvas from "./kanvas";
import Managers from "./managers";
import Systems from "./systems";

const { TOKEN } = process.env;

export default class Kuramisa extends SapphireClient {
    initialized = false;
    startTime = Date.now();

    readonly database: Database;

    readonly kanvas: Kanvas;
    readonly games: Games;
    readonly managers: Managers;
    readonly systems: Systems;

    readonly cooldowns = new Collection<string, Collection<string, number>>();

    readonly kEmojis = new Collection<string, ApplicationEmoji>();

    readonly owners = new Collection<string, User>();

    constructor() {
        super({
            intents: [
                "GuildBans",
                "GuildInvites",
                "Guilds",
                "GuildEmojisAndStickers",
                "GuildMessageReactions",
                "GuildMessagePolls",
                "GuildPresences",
                "GuildMessages",
                "GuildVoiceStates",
                "GuildIntegrations",
                "MessageContent",
                "GuildMembers",
                "DirectMessages",
            ],
            partials: [Partials.Channel, Partials.Message, Partials.User],
            shards: "auto",
            logger: {
                level:
                    process.env.NODE_ENV === "development"
                        ? LogLevel.Debug
                        : LogLevel.Info,
            },
        });

        this.database = new Database();

        this.kanvas = new Kanvas();
        this.games = new Games(this);
        this.managers = new Managers(this);
        this.systems = new Systems(this);

        this.stores
            .get("listeners")
            .registerPath(path.join(getRootData().root, "events"));
    }

    getActivities(): PresenceData[] {
        return [
            {
                status: "online",
                activities: [
                    {
                        name: "Custom Status",
                        state: "Pet fox",
                        type: ActivityType.Custom,
                    },
                ],
            },
            {
                status: "online",
                activities: [
                    {
                        name: "Custom Status 2",
                        state: `Watching Over ${this.guilds.cache.size} servers`,
                        type: ActivityType.Custom,
                    },
                ],
            },
            {
                status: "online",
                activities: [
                    {
                        name: "Custom Status 3",
                        state: `Watching Over ${this.users.cache.size} users`,
                        type: ActivityType.Custom,
                    },
                ],
            },
        ];
    }

    getActivity(): PresenceData {
        return pickRandom(this.getActivities());
    }

    async login() {
        await this.database.connect();

        await dLogs(this, {
            debug: process.env.NODE_ENV === "development",
        });

        await this.systems.music.init();

        await this.games.valorant.init();

        return super.login(TOKEN);
    }

    mentionCommand(
        command: string,
        extra: {
            subcommand: string;
            group: string;
        },
    ): string {
        if (!this.isReady()) return "";
        const appCommand = this.application.commands.cache.find(
            (c) => c.name === command,
        );
        if (!appCommand) {
            this.logger.error(
                `Couldn't mention ${command}, since it doesn't exist`,
            );
            return "";
        }

        let commandLiteral = command;
        if (extra.group) commandLiteral += ` ${extra.group}`;
        if (extra.subcommand) commandLiteral += ` ${extra.subcommand}`;

        return `</${commandLiteral}:${appCommand.id}>`;
    }
}
