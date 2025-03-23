import { Collection, Locale } from "discord.js";
import fs from "fs/promises";
import logger from "Logger";
import ms from "ms";
import path from "path";
import { pathToFileURL } from "url";

export default class LocaleStore {
    readonly data = new Collection<Locale, Collection<string, any>>();

    async load() {
        const startTime = Date.now();
        logger.info(`[Locale Store] Loading languages...`);

        const filesOrDirs = (await fs.readdir(
            path.join(__dirname, "../../locales")
        )) as Locale[];

        for (const fileOrDir of filesOrDirs) {
            const deepLocaleDir = path.resolve(
                __dirname,
                "../../locales",
                fileOrDir
            );

            if (!this.data.has(fileOrDir))
                this.data.set(fileOrDir, new Collection());

            const isDir = (await fs.stat(deepLocaleDir)).isDirectory();

            if (isDir) {
                const deepFiles = await fs.readdir(deepLocaleDir);

                for (const deepFile of deepFiles) {
                    const { default: locale } = await import(
                        pathToFileURL(path.resolve(deepLocaleDir, deepFile))
                            .href
                    );

                    this.data
                        .get(fileOrDir)
                        ?.set(deepFile.split(".")[0], locale);

                    logger.debug(
                        `[Locale Store] Loaded ${deepFile.split(".")[0]} on ${fileOrDir}`
                    );
                }
            }

            logger.debug(`[Locale Store] Loaded all ${fileOrDir}`);
        }

        logger.info(
            `[Locale Store] Loaded languages in ${ms(Date.now() - startTime)}`
        );
    }
}
