import { AbstractMenuCommand } from "@classes/MenuCommand";
import { AbstractSlashCommand } from "@classes/SlashCommand";
import { Collection } from "discord.js";
import fs from "fs/promises";
import path from "path";

export default class CommandStore {
    readonly slashCommands: Collection<string, AbstractSlashCommand> =
        new Collection();
    readonly menuCommands: Collection<string, any> = new Collection();
    readonly commands: Collection<
        string,
        AbstractMenuCommand | AbstractSlashCommand
    > = new Collection();
    readonly categories: Collection<string, Collection<string, any>> =
        new Collection();

    async load() {
        const commandDirectory = path.resolve(`${__dirname}/../commands`);
        const files = await fs.readdir(commandDirectory);

        for (const fileOrDir of files) {
            const deepCmdDir = path.resolve(`${commandDirectory}/${fileOrDir}`);
            const isDir = (await fs.stat(deepCmdDir)).isDirectory();

            if (isDir) {
                const deepFiles = await fs.readdir(deepCmdDir);
                if (deepFiles.length === 0) continue;
                this.categories.set(fileOrDir, new Collection());
                for (const file of deepFiles) {
                    const commandPath = path.resolve(
                        `${commandDirectory}/${fileOrDir}/${file}`
                    );
                    const isFile = (await fs.stat(commandPath)).isFile();
                    if (!isFile) continue;
                    const command = require(
                        path.resolve(`${commandDirectory}/${fileOrDir}/${file}`)
                    ).default;

                    const instance = new command();

                    this.categories
                        .get(fileOrDir)
                        ?.set(instance.name, instance);

                    if (instance instanceof AbstractSlashCommand) {
                        this.slashCommands.set(instance.name, instance);
                    }

                    this.commands.set(instance.name, instance);

                    if (instance instanceof AbstractMenuCommand) {
                        this.menuCommands.set(instance.name, instance);
                    }
                }
            }

            const commandPath = path.resolve(
                `${commandDirectory}/${fileOrDir}`
            );
            const isFile = (await fs.stat(commandPath)).isFile();
            if (!isFile) continue;

            this.categories.set("none", new Collection());

            const command = require(commandPath).default;
            const instance = new command();

            this.categories.get("none")?.set(instance.name, instance);

            if (instance instanceof AbstractMenuCommand) {
                this.menuCommands.set(instance.name, instance);
            }
        }
    }
}
