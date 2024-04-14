import { Listener } from "@sapphire/framework";
import { type Guild } from "discord.js";

export class GuildJoinListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "WHen bot joins server",
            event: "guildCreate"
        });
    }

    async run(guild: Guild) {
        await this.container.database.guilds.fetch(guild.id);
    }
}
