import { Listener } from "@sapphire/framework";
import { ChannelType, GuildChannel } from "discord.js";

export class DeletedDVCListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "Remove channel from database",
            event: "channelDelete",
        });
    }

    async run(channel: GuildChannel) {
        if (channel.type !== ChannelType.GuildVoice) return;

        const { database } = this.container;
        const { guild } = channel;

        const db = await database.guilds.fetch(guild.id);

        const dvc = db.dvc.find((d) => d.id === channel.id);

        if (!dvc) return;

        if (!db.dvc.find((ch) => ch.id === channel.id)) return;

        db.dvc = db.dvc.filter((vc) => vc.id !== channel.id);

        db.markModified("dvc");
        await db.save();
    }
}
