import { Listener } from "@sapphire/framework";
import { GuildMember } from "discord.js";

export class MemberLeaveLogListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "Logging for member leaving",
            event: "guildMemberRemove"
        });
    }

    async run(member: GuildMember) {
        if (member.user.bot) return;

        const { database, util } = this.container;

        const { guild } = member;
        const db = await database.guilds.fetch(guild.id);
        if (!db || !db.logs.channel || !db.logs.types.memberLeave) return;

        const channel = guild.channels.cache.get(db.logs.channel);
        if (!channel || !channel.isTextBased()) return;

        if (!guild.members.me?.permissionsIn(channel).has("SendMessages"))
            return;

        const embed = util
            .embed()
            .setAuthor({
                name: `${guild.name} Member Logs`,
                iconURL: guild.iconURL() as string
            })
            .setTitle(`${member.user.username} Left`)
            .setThumbnail(member.displayAvatarURL())
            .addFields(
                {
                    name: "Joined Server",
                    value: `<t:${Math.floor(
                        (member.joinedTimestamp as number) / 1000
                    )}:R>`,
                    inline: true
                },
                {
                    name: "Joined Discord",
                    value: `<t:${Math.floor(
                        (member.user.createdTimestamp as number) / 1000
                    )}:R>`,
                    inline: true
                }
            )
            .setFooter({ text: `ID: ${member.id}` });

        return channel.send({ embeds: [embed] });
    }
}
