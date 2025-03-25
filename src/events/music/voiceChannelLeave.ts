import { AbstractEvent, Event } from "classes/Event";
import type { GuildMember } from "discord.js";
import type { QueueMetadata } from "typings/Music";

@Event({
    event: "voiceChannelLeave",
    description: "Event that triggers when a user leaves a voice channel",
})
export default class VoiceChannelLeaveEvent extends AbstractEvent {
    async run(member: GuildMember) {
        if (!member.user.bot) return;
        const { guild } = member;
        const {
            systems: { music },
        } = this.client;

        const queue = music.queues.get<QueueMetadata>(guild);

        if (!queue) return;
        if (member.id !== guild.members.me?.id) return;

        if (guild.musicMessage) {
            guild.musicMessage.delete();
            guild.musicMessage = null;
        }

        queue.delete();
    }
}
