import { Listener } from "@sapphire/framework";
import { GuildMember } from "discord.js";

export class MemberNicknameChangLogListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "Log when member changes their nickname",
            event: "guildMemberNicknameUpdate",
        });
    }

    async run(member: GuildMember, oldNick: string, newNick: string) {
        if (member.user.bot) return;

        const { database, util } = this.container;

        const { guild } = member;
        const db = await database.guilds.fetch(guild.id);
        if (!db || !db.logs.channel || !db.logs.types.memberNicknameChange)
            return;

        const channel = guild.channels.cache.get(db.logs.channel);
        if (!channel || !channel.isTextBased()) return;

        if (!guild.members.me?.permissionsIn(channel).has("SendMessages"))
            return;

        const embed = util
            .embed()
            .setAuthor({
                name: `${guild.name} Member Logs`,
                iconURL: guild.iconURL() as string,
            })
            .setTitle(`${member.user.username} Changed Nickname`)
            .setThumbnail(member.displayAvatarURL())
            .setDescription(
                `\`Old\`: ${oldNick ? oldNick : "None"}\n\`New\`: ${
                    newNick ? newNick : "None"
                }`
            );

        return channel.send({ embeds: [embed] });
    }
}
