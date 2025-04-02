import { Collection, type Guild, type Snowflake } from "discord.js";
import type Kuramisa from "Kuramisa";
import type { GuildDocument } from "models/Guild";
import guildModel from "models/Guild";
export default class GuildManager {
    private readonly client: Kuramisa;
    readonly cache: Collection<string, GuildDocument>;

    constructor(client: Kuramisa) {
        this.client = client;
        this.cache = new Collection();
    }

    async create(guild: Guild) {
        const doc = await guildModel.create({
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
            (await guildModel.findOne({ id })) ?? (await this.create(guild));

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
        if (!guild.members.me?.permissionsIn(channel).has("SendMessages"))
            return null;

        return channel;
    }
}
