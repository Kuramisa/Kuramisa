import { Listener } from "@sapphire/framework";
import { useQueue } from "discord-player";
import { GuildMember } from "discord.js";

export class VoiceChannelLeaveListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            event: "voiceChannelLeave"
        });
    }

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
