import type Kuramisa from "@kuramisa";
import GuildModel, { type GuildDocument } from "@models/Guild";
import { Collection, type Guild, type Snowflake } from "discord.js";
export default class GuildManager {
    readonly cache: Collection<string, GuildDocument>;

    constructor(private readonly client: Kuramisa) {
        this.cache = new Collection();
    }

    async create(guild: Guild) {
        const doc = await GuildModel.create({
            id: guild.id,
            name: guild.name,
        });

        this.client.logger.info(
            `[Guild Manager] Guild added to the database (ID: ${guild.id} - Name: ${guild.name})`,
        );

        return doc;
    }

    get = (id: Snowflake) => this.cache.get(id) ?? this.fetch(id);

    async fetch(id: Snowflake) {
        const guild =
            this.client.guilds.cache.get(id) ??
            (await this.client.guilds.fetch(id));
        const doc =
            (await GuildModel.findOne({ id })) ?? (await this.create(guild));

        this.cache.set(id, doc);

        return doc;
    }

    async logsChannel(guild: Guild) {
        const db = await this.get(guild.id);
        if (!db.logs.channel) return null;
        const channel =
            guild.channels.cache.get(db.logs.channel) ??
            (await guild.channels.fetch(db.logs.channel).catch(() => null));

        if (!channel) return null;
        if (!channel.isTextBased()) return null;
        if (!guild.members.me) return null;
        if (!channel.permissionsFor(guild.members.me).has("SendMessages"))
            return null;

        return channel;
    }
}
