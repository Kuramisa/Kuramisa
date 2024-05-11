import { AbstractKEvent } from "@classes/KEvent";
import { Collection } from "discord.js";
import fs from "fs/promises";
import path from "path";
import logger from "@struct/Logger";

export default class EventStore {
    readonly events: Collection<string, AbstractKEvent[]> = new Collection();

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

                    if (!this.events.has(instance.event)) {
                        this.events.set(instance.event, []);
                    }

                    this.events.get(instance.event)?.push(instance);

                    logger.debug(
                        `[Event Store] Loaded event ${instance.event}`
                    );
                }
            }

            const eventPath = path.resolve(`${eventDirectory}/${fileOrDir}`);

            const isFile = (await fs.stat(eventPath)).isFile();
            if (!isFile) continue;

            const event = require(eventPath).default;

            const instance = new event();

            if (!this.events.has(instance.event)) {
                this.events.set(instance.event, []);
            }

            this.events.get(instance.event)?.push(instance);

            logger.debug(`[Event Store] Loaded event ${instance.event}`);
        }
    }
}
