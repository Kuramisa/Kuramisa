import {
    ActivityType,
    ApplicationEmoji,
    Client,
    Collection,
    Partials,
    type PresenceData,
} from "discord.js";
import Stores from "stores";
import crypto from "crypto";
import Systems from "systems";

import mongoose from "mongoose";
import logger from "Logger";
import Managers from "managers";

const { TOKEN, DATABASE } = process.env;

if (!TOKEN) throw new Error("No bot token provided");
if (!DATABASE) throw new Error("No database connection string provided");

export default class Kuramisa extends Client {
    initialized = false;
    startTime = Date.now();

    readonly managers: Managers;
    readonly stores: Stores;
    readonly systems: Systems;

    readonly cooldowns = new Collection<string, Collection<string, number>>();

    kEmojis = new Collection<string, ApplicationEmoji>();

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
                "DirectMessages",
            ],
            partials: [Partials.Channel, Partials.Message, Partials.User],
        });

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
        await mongoose
            .connect(DATABASE!)
            .then(() => logger.info("[Database] Connected to the database"))
            .catch((err) =>
                logger.error("[Database] Error connecting to the database", err)
            );

        await this.systems.music.init();

        await this.stores.commands.load();
        await this.stores.events.load();

        return super.login(TOKEN);
    }
}
