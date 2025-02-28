import kuramisa from "@kuramisa";
import { ApplicationCommand, Collection, Routes } from "discord.js";
import logger from "Logger";
import ms from "ms";

export default class CommandManager {
    async compareCommands() {
        try {
            if (!kuramisa.isReady()) throw new Error("Kuramisa is not ready!");

            const localCommands = kuramisa.stores.commands.commands.values();
            const applicationCommands =
                await kuramisa.application.commands.fetch();

            const commandsToCreate = [];
            const commandsToUpdate = [];
            const commandsToDelete = new Collection<
                string,
                ApplicationCommand
            >();

            applicationCommands.forEach((cmd) =>
                commandsToDelete.set(cmd.name, cmd)
            );

            for (const localCmd of localCommands) {
                const registeredCmd = applicationCommands.find(
                    (cmd) => cmd.name === localCmd.name
                );

                if (!registeredCmd) {
                    logger.debug(
                        `[Command Manager] Command ${localCmd.name} will be created`
                    );

                    commandsToCreate.push(localCmd.data);
                    continue;
                }

                commandsToDelete.delete(registeredCmd.name);

                const areCommandsDiff =
                    JSON.stringify(localCmd.data.toJSON()) !==
                    JSON.stringify(registeredCmd.toJSON());

                if (areCommandsDiff) {
                    logger.debug(
                        `[Command Manager] Command ${localCmd.name} will be updated`
                    );
                    commandsToUpdate.push(localCmd.data);
                }
            }

            return {
                commandsToCreate,
                commandsToUpdate,
                commandsToDelete: Array.from(commandsToDelete.values()),
            };
        } catch (err) {
            logger.error("Error comparing commands: ", err);
            return {
                commandsToCreate: [],
                commandsToUpdate: [],
                commandsToDelete: [],
            };
        }
    }

    async updateCommands() {
        if (!kuramisa.isReady()) throw new Error("Kuramisa is not ready!");
        const startTime = Date.now();

        const commands = Array.from(kuramisa.stores.commands.commands.values());

        logger.info(`[Command Manager] Updating commands...`);

        await kuramisa.rest.put(
            Routes.applicationCommands(kuramisa.application.id),
            {
                body: commands.map((cmd) => cmd.data.toJSON()),
            }
        );

        logger.info(
            `[Command Manager] Updated commands in ${ms(Date.now() - startTime)}`
        );
    }
}
