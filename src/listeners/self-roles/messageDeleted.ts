import { Listener } from "@sapphire/framework";
import type { Message } from "discord.js";
import { ChannelType } from "discord.js";

export default class SelfRolesMessageDeleted extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "messageDelete",
            description:
                "Event that triggers when a message is deleted for self roles",
        });
    }

    async run(message: Message) {
        if (!message.inGuild()) return;

        const {
            client: { managers },
            guild,
            channel,
        } = message;
        if (channel.type !== ChannelType.GuildText) return;

        const db = await managers.guilds.get(guild.id);

        const selfRoleChannel = db.selfRoles.find(
            (selfRole) => selfRole.channelId === channel.id,
        );
        if (!selfRoleChannel) return;

        selfRoleChannel.messages = selfRoleChannel.messages.filter(
            (selfRoleMessage) => selfRoleMessage.id !== message.id,
        );

        db.markModified("selfRoles");
        await db.save();
    }
}
