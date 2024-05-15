import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { ChannelType, VoiceState } from "discord.js";

@KEvent({
    event: "voiceStateUpdate",
    description: "Manage Dynamic Voice Channel deletion."
})
export default class DeletedEmptyDvcEvent extends AbstractKEvent {
    async run(state: VoiceState) {
        const { database } = this.client;

        if (!state.channel) return;
        if (state.channel.type !== ChannelType.GuildVoice) return;

        const { guild, channel } = state;

        if (!channel.parent) return;

        const { parent } = channel;

        const db = await database.guilds.fetch(guild.id);
        const dvc = db.dvc.find((d) => d.id === parent.id);
        if (!dvc) return;

        const channels = parent.children.cache.filter((ch) =>
            ch.name.startsWith(channel.name)
        );

        for (const ch of channels.values()) {
            if (ch.type !== ChannelType.GuildVoice) continue;
            if (ch.members.size > 0) continue;
            if (ch.id === dvc.parentId) continue;
            db.dvc = db.dvc.filter((vc) => vc.id !== ch.id);
            await ch.delete();
        }

        db.markModified("dvc");
        await db.save();
    }
}
