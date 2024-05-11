import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { useQueue } from "discord-player";
import { GuildMember } from "discord.js";

@KEvent({
    event: "voiceChannelLeave",
    description: "Event that triggers when a user leaves a voice channel"
})
export default class Event extends AbstractKEvent {
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
