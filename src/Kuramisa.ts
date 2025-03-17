import {
    ActivityType,
    ApplicationEmoji,
    Client,
    Collection,
    Partials,
    User,
    type PresenceData,
} from "discord.js";
import Stores from "stores";
import crypto from "crypto";
import Systems from "systems";

import Managers from "managers";
import Kanvas from "kanvas";

import dLogs from "discord-logs";
import Games from "games";
import Database from "database";

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
        });

        this.database = new Database();

        this.kanvas = new Kanvas();
        this.games = new Games();
        this.managers = new Managers();
        this.stores = new Stores();
        this.systems = new Systems(this);
    }

    getActivities(): PresenceData {
        const activities: PresenceData[] = [
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

        const randomIndex = crypto.randomInt(0, activities.length);
        return activities[randomIndex];
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
}
