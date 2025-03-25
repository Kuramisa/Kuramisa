import { pickRandom } from "@sapphire/utilities";
import dLogs from "discord-logs";
import type { ApplicationEmoji } from "discord.js";
import {
    ActivityType,
    Client,
    Collection,
    Partials,
    type PresenceData,
    type User,
} from "discord.js";

import Database from "./database";
import Games from "./games";
import Kanvas from "./kanvas";
import Managers from "./managers";
import Stores from "./stores";
import Systems from "./systems";

const { TOKEN, DATABASE } = process.env;

if (!TOKEN) throw new Error("No bot token provided");
if (!DATABASE) throw new Error("No database connection string provided");

export default class Kuramisa extends Client {
    initialized = false;
    startTime = Date.now();

    readonly database: Database;

    readonly kanvas: Kanvas;
    readonly games: Games;
    readonly managers: Managers;
    readonly stores: Stores;
    readonly systems: Systems;

    readonly cooldowns = new Collection<string, Collection<string, number>>();

    readonly kEmojis = new Collection<string, ApplicationEmoji>();

    readonly owners: User[] = [];

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
        });

        this.database = new Database();

        this.kanvas = new Kanvas();
        this.games = new Games(this);
        this.managers = new Managers(this);
        this.stores = new Stores(this);
        this.systems = new Systems(this);
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

        await this.stores.commands.load();
        await this.stores.events.load();

        await this.games.valorant.init();

        return super.login(TOKEN);
    }

    mentionCommand = (
        command: string,
        subName?: string,
        group?: string,
    ): string => {
        if (!this.isReady()) return "";
        const appCommand = this.application.commands.cache.find(
            (c) => c.name === command,
        );
        if (!appCommand) {
            console.error(
                `Couldn't mention ${command}, since it doesn't exist`,
            );
            return "";
        }

        let commandLiteral = command;
        if (group) commandLiteral += ` ${group}`;
        if (subName) commandLiteral += ` ${subName}`;

        return `</${commandLiteral}:${appCommand.id}>`;
    };
}
