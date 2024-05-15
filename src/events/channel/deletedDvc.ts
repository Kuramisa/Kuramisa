import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { ChannelType, GuildChannel } from "discord.js";

@KEvent({
    event: "channelDelete",
    description: "Manage Dynamic Voice Channel deletion."
})
export default class DeletedDvcEvent extends AbstractKEvent {
    async run(channel: GuildChannel) {
        if (channel.type !== ChannelType.GuildVoice) return;

        const { database } = this.client;
        const { guildId } = channel;

        const guild = await database.guilds.fetch(guildId);
        const dvc = guild.dvc.find((d) => d.id === channel.id);
        if (!dvc) return;
        if (!guild.dvc.find((ch) => ch.id === channel.id)) return;

        guild.dvc = guild.dvc.filter((ch) => ch.id !== channel.id);

        guild.markModified("dvc");
        await guild.save();
    }
}
