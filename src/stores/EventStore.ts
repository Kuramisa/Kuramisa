import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

import type { AbstractEvent } from "classes/Event";
import { Collection } from "discord.js";
import type Kuramisa from "Kuramisa";
import logger from "Logger";
import ms from "ms";

export default class EventStore {
    private readonly client: Kuramisa;

    constructor(client: Kuramisa) {
        this.client = client;
    }

    readonly events = new Collection<string, AbstractEvent[]>();

    async load() {
        const startTime = Date.now();
        logger.info("[Event Store] Loading events...");

        const eventDirectory = path.resolve(import.meta.dirname, "../events");
        const files = await fs.readdir(eventDirectory);

        for (const fileOrDir of files) {
            const deepEventDir = path.resolve(eventDirectory, fileOrDir);
            const isDirectory = (await fs.stat(deepEventDir)).isDirectory();
            if (isDirectory) {
                const deepFiles = await fs.readdir(deepEventDir);
                for (const deepFile of deepFiles) {
                    const event = (await import(
                        pathToFileURL(path.resolve(deepEventDir, deepFile)).href
                    )) as { default: new (client: Kuramisa) => AbstractEvent };

                    const eventInstance = new event.default(this.client);
                    if (!this.events.has(eventInstance.event))
                        this.events.set(eventInstance.event, []);
                    this.events.get(eventInstance.event)?.push(eventInstance);

                    logger.debug(
                        `[Event Store] Loaded event: ${eventInstance.event} (${eventInstance.description})`,
                    );
                }
            }

            const eventPath = path.resolve(eventDirectory, fileOrDir);
            const isFile = (await fs.stat(eventPath)).isFile();
            if (!isFile) continue;

            const event = (await import(pathToFileURL(eventPath).href)) as {
                default: new (client: Kuramisa) => AbstractEvent;
            };
            const eventInstance = new event.default(this.client);

            if (!this.events.has(eventInstance.event))
                this.events.set(eventInstance.event, []);

            this.events.get(eventInstance.event)?.push(eventInstance);

            logger.info(
                `[Event Store] Loaded event: ${eventInstance.event} (${eventInstance.description})`,
            );
        }

        logger.info(
            `[Event Store] Loaded ${this.events.reduce(
                (acc, events) => acc + events.length,
                0,
            )} events in ${ms(Date.now() - startTime)}`,
        );
    }
}
