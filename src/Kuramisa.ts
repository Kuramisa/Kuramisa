import { Client, Partials, Routes } from "discord.js";
import logger from "Logger";

import dLogs from "discord-logs";

import Database from "./Database";
import Managers from "managers";
import Stores from "./stores";

const { NODE_ENV, TOKEN } = process.env;

export default class Kuramisa extends Client {
    readonly database = new Database();
    readonly managers = new Managers();
    readonly logger = logger;

    readonly stores = new Stores();

    initialized = false;

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
        if (!this.user) return;

        const { rest, user: bot } = this;

        const restCommands = (await rest.get(
            Routes.applicationCommands(bot.id)
        )) as any[];
        const { commands } = this.stores.commands;

        const startTime = Date.now();
        logger.debug("[REST] Updating Commands...");

        for (const [_, command] of commands) {
            const commandData = command.data.toJSON();
            const restCommand = restCommands.find(
                (c) => c.name === commandData.name
            );

            if (!restCommand) {
                logger.debug(`[REST] Creating (${commandData.name})`);
                await rest.post(Routes.applicationCommands(bot.id), {
                    body: commandData
                });
            } else {
                logger.debug(`[REST] Updating (${commandData.name})`);
                await rest.patch(
                    Routes.applicationCommand(bot.id, restCommand.id),
                    { body: commandData }
                );
            }
        }

        logger.debug(`[REST] Updated Commands in ${Date.now() - startTime}ms`);
    }
}
