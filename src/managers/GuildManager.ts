import kuramisa from "@kuramisa";
import { Collection, type Guild, type Snowflake } from "discord.js";
import logger from "Logger";
import type { GuildDocument } from "models/Guild";
import guildModel from "models/Guild";

export default class GuildManager {
    readonly cache: Collection<string, GuildDocument>;

    constructor() {
        this.cache = new Collection();
    }

    async create(guild: Guild) {
        const doc = await guildModel.create({
            id: guild.id,
            name: guild.name,
        });

        logger.info(
            `[Guild Manager] Guild added to the database (ID: ${guild.id} - Name: ${guild.name})`
        );

        return doc;
    }

    get = (id: Snowflake) => this.cache.get(id) ?? this.fetch(id);

    async fetch(id: Snowflake) {
        const guild =
            kuramisa.guilds.cache.get(id) ?? (await kuramisa.guilds.fetch(id));
        const doc =
            (await guildModel.findOne({ id })) ?? (await this.create(guild));

        this.cache.set(id, doc);

        return doc;
    }
}
