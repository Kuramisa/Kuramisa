import kuramisa from "@kuramisa";
import { Collection, type Guild, type Snowflake } from "discord.js";
import merge from "lodash/merge";
import logger from "Logger";
import type { IGuild } from "models/Guild";
import guildModel from "models/Guild";

export default class GuildManager {
    readonly cache: Collection<string, Guild & IGuild>;

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

        const info = merge(guild, doc.toObject());

        if (!this.cache.has(guild.id)) this.cache.set(guild.id, info);

        return info;
    }

    get = (id: Snowflake) => this.cache.get(id) ?? this.fetch(id);

    async fetch(id: Snowflake) {
        let guild = kuramisa.guilds.cache.get(id);
        if (!guild) guild = await kuramisa.guilds.fetch(id);

        const doc = await guildModel.findOne({ id });
        if (!doc) return this.create(guild);

        const info = merge(guild, doc.toObject());

        this.cache.set(id, info);

        return info;
    }
}
