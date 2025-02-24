import kuramisa from "@kuramisa";
import { ApplicationCommand, Collection } from "discord.js";
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

            console.log(localCommands);

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

        const { commandsToCreate, commandsToUpdate, commandsToDelete } =
            await this.compareCommands();

        if (
            commandsToCreate.length < 1 &&
            commandsToUpdate.length < 1 &&
            commandsToDelete.length < 1
        ) {
            logger.info(
                "[Command Manager] No commands to create, update or delete"
            );
            return;
        }

        for (const cmdToDelete of commandsToDelete) {
            logger.debug(
                `[Command Manager] Deleting command ${cmdToDelete.name}`
            );
            await kuramisa.application.commands.delete(cmdToDelete.id);
        }

        for (const cmdToCreate of commandsToCreate) {
            logger.debug(
                `[Command Manager] Creating command ${cmdToCreate.name}`
            );
            await kuramisa.application.commands.create(cmdToCreate);
        }

        for (const cmdToUpdate of commandsToUpdate) {
            logger.debug(
                `[Command Manager] Updating command ${cmdToUpdate.name}`
            );
            const existingCmd = await kuramisa.application.commands.fetch();
            const cmdToUpdateId = existingCmd.find(
                (cmd) => cmd.name === cmdToUpdate.name
            )?.id;
            if (cmdToUpdateId) {
                await kuramisa.application.commands.edit(
                    cmdToUpdateId,
                    cmdToUpdate
                );
            }
        }

        logger.info(
            `[Command Manager] Updated commands in ${ms(Date.now() - startTime)}`
        );
    }
}
