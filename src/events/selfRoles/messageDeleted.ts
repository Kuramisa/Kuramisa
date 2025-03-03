import { AbstractEvent, Event } from "classes/Event";
import { ChannelType, Message } from "discord.js";

@Event({
    event: "messageDelete",
    description:
        "Will update the database if a channel is deleted for self roles",
})
export default class SelfRolesMessageDeleted extends AbstractEvent {
    async run(message: Message) {
        if (!message.inGuild()) return;

        const { database } = this.client;
        const { guild, channel } = message;
        if (channel.type !== ChannelType.GuildText) return;

        const db = await database.guilds.fetch(guild.id);

        const selfRoleChannel = db.selfRoles.find(
            (selfRole) => selfRole.channelId === channel.id
        );
        if (!selfRoleChannel) return;

        selfRoleChannel.messages = selfRoleChannel.messages.filter(
            (selfRoleMessage) => selfRoleMessage.id !== message.id
        );

        db.markModified("selfRoles");
        await db.save();
    }
}
