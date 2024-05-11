import kuramisa from "@kuramisa";

import {
    Collection,
    type Guild,
    type InviteGuild,
    type OAuth2Guild,
    type Snowflake
} from "discord.js";

import DBGuild, { type GuildDocument } from "../../schemas/Guild";

export default class DatabaseGuilds {
    readonly cache: Collection<string, GuildDocument>;

    constructor() {
        this.cache = new Collection();
    }

    async create(guild: Guild | OAuth2Guild | InviteGuild) {
        const { logger } = kuramisa;

        logger.info(
            `Guild added to the database (ID: ${guild.id} - Name: ${guild.name})`
        );

        const doc = await DBGuild.create({ id: guild.id, name: guild.name });

        if (!this.cache.has(guild.id)) this.cache.set(guild.id, doc);

        return doc;
    }

    async fetch(guildId: Snowflake) {
        let doc = await DBGuild.findOne({ id: guildId });

        if (!doc) {
            const { guilds } = kuramisa;

            let guild = guilds.cache.get(guildId);
            if (!guild) guild = await guilds.fetch(guildId);

            doc = await this.create(guild);
        }

        if (!this.cache.has(guildId)) this.cache.set(guildId, doc);

        return doc;
    }

    fetchAll = () => DBGuild.find();
}
