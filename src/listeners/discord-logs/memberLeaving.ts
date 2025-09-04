import { Embed } from "@builders";
import { Listener } from "@sapphire/framework";
import type { GuildMember } from "discord.js";

export default class MemberLeaveEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "guildMemberRemove",
            name: "member-leave",
            description: "Logs when a member leaves the server",
        });
    }

    async run(member: GuildMember) {
        const {
            client: { managers },
            guild,
        } = member;

        const channel = await managers.guilds.logsChannel(guild);
        if (!channel) return;

        const db = await managers.guilds.get(guild.id);
        if (!db.logs.types.memberLeave) return;

        const embed = new Embed()
            .setAuthor({
                name: `${guild.name} Member Logs`,
                iconURL: guild.iconURL() ?? "",
            })
            .setTitle(`${member.user.displayName} Left`)
            .setThumbnail(member.displayAvatarURL())
            .addFields({
                name: "Joined Discord",
                value: `<t:${Math.floor(
                    member.user.createdTimestamp / 1000,
                )}:R>`,
                inline: true,
            })
            .setFooter({ text: `ID: ${member.id}` });

        if (member.joinedTimestamp)
            embed.addFields({
                name: "Joined Server",
                value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
                inline: true,
            });

        await channel.send({ embeds: [embed] });
    }
}
