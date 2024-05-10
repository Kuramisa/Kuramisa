import { AbstractDiscordEvent } from "@classes/DiscordEvent";
import { Collection } from "discord.js";
import fs from "fs/promises";
import path from "path";

export default class EventStore {
    readonly events: Collection<string, AbstractDiscordEvent[]> =
        new Collection();

    async load() {
        const eventDirectory = path.resolve(`${__dirname}/../events`);
        const files = await fs.readdir(eventDirectory);

        for (const fileOrDir of files) {
            // Event Path
            const deepEventDir = path.resolve(`${eventDirectory}/${fileOrDir}`);

            const isDir = (await fs.stat(deepEventDir)).isDirectory();
            if (isDir) {
                const deepFiles = await fs.readdir(deepEventDir);
                if (deepFiles.length === 0) continue;
                for (const file of deepFiles) {
                    const eventPath = path.resolve(
                        `${eventDirectory}/${fileOrDir}/${file}`
                    );
                    const isFile = (await fs.stat(eventPath)).isFile();
                    if (!isFile) continue;
                    const event = require(
                        path.resolve(`${eventDirectory}/${fileOrDir}/${file}`)
                    ).default;
                    const instance = new event();

                    if (!this.events.has(instance.name)) {
                        this.events.set(instance.name, []);
                    }

                    this.events.get(instance.name)?.push(instance);
                }
            }

            const eventPath = path.resolve(`${eventDirectory}/${fileOrDir}`);

            const isFile = (await fs.stat(eventPath)).isFile();
            if (!isFile) continue;

            const event = require(eventPath).default;

            const instance = new event();

            if (!this.events.has(instance.name)) {
                this.events.set(instance.name, []);
            }

            this.events.get(instance.name)?.push(instance);
        }
    }
}
