import { Routes } from "discord.js";
import type Kuramisa from "Kuramisa";
import logger from "Logger";
import ms from "ms";

export default class CommandManager {
    private readonly client: Kuramisa;

    constructor(client: Kuramisa) {
        this.client = client;
    }

    async updateCommands() {
        if (!this.client.isReady()) {
            logger.warn(
                `[Command Manager] Client is not ready, skipping command update...`,
            );
            return;
        }
        const startTime = Date.now();

        const commands = Array.from(
            this.client.stores.commands.commands.values(),
        );

        logger.info(`[Command Manager] Updating commands...`);

        await this.client.rest.put(
            Routes.applicationCommands(this.client.application.id),
            {
                body: commands.map((cmd) => cmd.data.toJSON()),
            },
        );

        logger.info(
            `[Command Manager] Updated commands in ${ms(Date.now() - startTime)}`,
        );
    }
}
