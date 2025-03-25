import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

import { AbstractMenuCommand } from "classes/MenuCommand";
import { Collection } from "discord.js";
import logger from "Logger";
import ms from "ms";

import { AbstractSlashCommand } from "../classes/SlashCommand";

export default class CommandStore {
    readonly commands = new Collection<
        string,
        AbstractSlashCommand | AbstractMenuCommand
    >();

    readonly slashCommands = new Collection<string, AbstractSlashCommand>();
    readonly menuCommands = new Collection<string, AbstractMenuCommand>();

    readonly categories = new Collection<
        string,
        Collection<string, AbstractSlashCommand | AbstractMenuCommand>
    >();

    get = (name: string) => this.commands.get(name);

    async load() {
        const startTime = Date.now();
        logger.info("[Command Store] Loading commands...");

        const files = await fs.readdir(
            path.join(import.meta.dirname, "../commands"),
        );

        for (const fileOrDir of files) {
            const deepCommandDir = path.resolve(
                import.meta.dirname,
                "../commands",
                fileOrDir,
            );
            const isDir = (await fs.stat(deepCommandDir)).isDirectory();

            if (isDir) {
                const deepFiles = await fs.readdir(deepCommandDir);

                for (const deepFile of deepFiles) {
                    const command = (await import(
                        pathToFileURL(path.resolve(deepCommandDir, deepFile))
                            .href
                    )) as { default: new () => AbstractSlashCommand };
                    const commandInstance = new command.default();

                    if (!this.commands.has(commandInstance.name))
                        this.commands.set(
                            commandInstance.name,
                            commandInstance,
                        );

                    if (commandInstance instanceof AbstractSlashCommand) {
                        this.slashCommands.set(
                            commandInstance.name,
                            commandInstance,
                        );
                    }

                    if (commandInstance instanceof AbstractMenuCommand) {
                        this.menuCommands.set(
                            commandInstance.name,
                            commandInstance,
                        );
                    }

                    if (!this.categories.has(fileOrDir))
                        this.categories.set(fileOrDir, new Collection());

                    this.categories
                        .get(fileOrDir)
                        ?.set(commandInstance.name, commandInstance);

                    const commandType =
                        commandInstance instanceof AbstractSlashCommand
                            ? "Slash Command"
                            : "Menu Command";

                    logger.debug(
                        `[Command Store] Loaded command: ${commandInstance.name} - ${commandType} (${commandInstance.description}) in category ${fileOrDir}`,
                    );
                }
            }

            const isFile = (await fs.stat(deepCommandDir)).isFile();
            if (!isFile) continue;

            const command = (await import(
                pathToFileURL(deepCommandDir).href
            )) as {
                default: new () => AbstractSlashCommand;
            };
            const commandInstance = new command.default();

            if (!this.categories.has("Uncategorized")) {
                this.categories.set("Uncategorized", new Collection());
            }

            this.categories
                .get("Uncategorized")
                ?.set(commandInstance.name, commandInstance);

            if (!this.commands.has(commandInstance.name))
                this.commands.set(commandInstance.name, commandInstance);

            if (commandInstance instanceof AbstractSlashCommand) {
                this.slashCommands.set(commandInstance.name, commandInstance);
            }

            if (commandInstance instanceof AbstractMenuCommand) {
                this.menuCommands.set(commandInstance.name, commandInstance);
            }

            const commandType =
                commandInstance instanceof AbstractSlashCommand
                    ? "Slash Command"
                    : "Menu Command";

            logger.debug(
                `[Command Store] Loaded command: ${commandInstance.name} - ${commandType} (${commandInstance.description}) in category Uncategorized`,
            );
        }

        logger.info(
            `[Command Store] Loaded ${
                this.commands.size
            } commands in ${ms(Date.now() - startTime)}`,
        );
    }
}
