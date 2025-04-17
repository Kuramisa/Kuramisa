import { Listener } from "@sapphire/framework";
import type { Channel } from "discord.js";
import { ChannelType } from "discord.js";

export default class SelfRolesChannelDeleted extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "channelDelete",
            description:
                "Event that triggers when a channel is deleted for self roles",
        });
    }

    async run(channel: Channel) {
        if (channel.isDMBased()) return;
        if (channel.type !== ChannelType.GuildText) return;

        const {
            client: { managers },
            guild,
        } = channel;

        const db = await managers.guilds.get(guild.id);

        db.selfRoles = db.selfRoles.filter(
            (selfRole) => selfRole.channelId !== channel.id,
        );

        await db.save();
    }
}
