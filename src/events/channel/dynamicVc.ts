import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { ChannelType, VoiceState } from "discord.js";

@KEvent({
    event: "voiceStateUpdate",
    description: "Manage Dynamic Voice Channel creation."
})
export default class DynamicVcEvent extends AbstractKEvent {
    async run(_: VoiceState, state: VoiceState) {
        if (!state.channel) return;
        if (state.channel.type !== ChannelType.GuildVoice) return;

        const { database } = this.client;
        const { guild, channel } = state;

        if (!channel.parent) return;

        const { parent } = channel;

        const db = await database.guilds.fetch(guild.id);

        const dvc = db.dvc.find((d) => d.id === channel.id);

        if (!dvc) return;

        const parentVc = guild.channels.cache.get(dvc.parentId);
        if (!parentVc || parentVc.type !== ChannelType.GuildVoice) return;

        const similarChannels = parent.children.cache.filter((c) =>
            c.name.startsWith(parentVc.name)
        );

        const newChannel = await guild.channels.create({
            name: `${parentVc.name} ${similarChannels.size + 1}`,
            parent: channel.parent,
            type: ChannelType.GuildVoice,
            position: channel.position + 1
        });

        db.dvc.push({
            parentId: parentVc.id,
            id: newChannel.id,
            categoryId: parent.id
        });
        db.markModified("dvc");
        await db.save();
    }
}
