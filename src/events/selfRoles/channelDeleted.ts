import { AbstractEvent, Event } from "classes/Event";
import { Channel, ChannelType } from "discord.js";

@Event({
    event: "channelDelete",
    description:
        "Will update the database if a channel is deleted for self roles",
})
export default class SelfRolesChannelDeleted extends AbstractEvent {
    async run(channel: Channel) {
        if (channel.isDMBased()) return;
        if (channel.type !== ChannelType.GuildText) return;

        const { database } = this.client;
        const { guild } = channel;

        const db = await database.guilds.fetch(guild.id);

        db.selfRoles = db.selfRoles.filter(
            (selfRole) => selfRole.channelId !== channel.id
        );

        await db.save();
    }
}
