import { AbstractEvent, Event } from "classes/Event";
import { useQueue } from "discord-player";
import { GuildMember } from "discord.js";

@Event({
    event: "voiceChannelLeave",
    description: "Event that triggers when a user leaves a voice channel",
})
export default class VoiceChannelLeaveEvent extends AbstractEvent {
    async run(member: GuildMember) {
        if (!member.user.bot) return;
        const { guild } = member;

        const queue = useQueue(guild);

        if (!queue) return;
        if (member.id !== guild.members.me?.id) return;

        if (guild.musicMessage) {
            guild.musicMessage.delete();
            guild.musicMessage = null;
        }

        queue.delete();
    }
}
