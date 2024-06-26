import kuramisa from "@kuramisa";
import { Collection, Guild, Snowflake } from "discord.js";
import DBGuild from "@schemas/Guild";
import { merge } from "lodash";

export default class GuildManager {
    readonly cache: Collection<string, KGuild>;

    constructor() {
        this.cache = new Collection();
    }

    async create(guild: Guild) {
        const { logger } = kuramisa;

        logger.info(
            `[Guild Manager] Guild added to the database (ID: ${guild.id} - Name: ${guild.name})`
        );

        const doc = await DBGuild.create({
            id: guild.id,
            name: guild.name
        });

        const info: KGuild = merge(guild, doc._doc);

        if (!this.cache.has(guild.id)) this.cache.set(guild.id, info);

        return info;
    }

    get(id: Snowflake) {
        return this.cache.get(id) ?? this.fetch(id);
    }

    async fetch(id: Snowflake) {
        let guild = kuramisa.guilds.cache.get(id);
        if (!guild) guild = await kuramisa.guilds.fetch(id);

        const doc = await DBGuild.findOne({ id });
        if (!doc) return this.create(guild);

        const info: KGuild = merge(guild, doc._doc);

        this.cache.set(id, info);

        return info;
    }
}
