import "@sapphire/plugin-logger/register";

import { container, LogLevel, SapphireClient } from "@sapphire/framework";
import { Collection, Partials } from "discord.js";

import logs from "discord-logs";

import Dashboard from "./dashboard";

import Database from "./struct/Database";
import Kanvas from "./struct/Kanvas";
import Moderation from "./struct/Moderation";
import Games from "./struct/Games";
import Systems from "./struct/Systems";
import Util from "./struct/Util";

const { TOKEN, NODE_ENV } = process.env;

export default class Kuramisa extends SapphireClient {
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
            partials: [Partials.Channel, Partials.Message, Partials.User],
            loadDefaultErrorListeners: true,
            logger: {
                level:
                    NODE_ENV === "development" ? LogLevel.Debug : LogLevel.Info
            }
        });

        logs(this, {
            debug: NODE_ENV === "development"
        });

        this.logger.info("Starting Kuramisa...");

        container.initialized = false;

        container.dashboard = new Dashboard();

        container.staff = [];
        container.owners = [];

        container.database = new Database();
        container.kanvas = new Kanvas();
        container.moderation = new Moderation();
        container.games = new Games();
        container.systems = new Systems();
        container.util = new Util();

        container.emojis = new Collection();

        this.login(TOKEN);
    }

    override async login(token?: string) {
        container.client.setMaxListeners(0);
        await container.database.connect();
        return super.login(token);
    }

    override async destroy() {
        await container.database.disconnect();
        return super.destroy();
    }
}
