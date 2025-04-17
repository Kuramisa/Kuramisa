import { Listener } from "@sapphire/framework";
import { Embed } from "Builders";
import type { GuildMember } from "discord.js";

export default class MemberJoinEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "guildMemberAdd",
            name: "member-join",
            description: "Logs when a member joins the server",
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
        if (!db.logs.types.memberJoin) return;

        const embed = new Embed()
            .setAuthor({
                name: `${guild.name} Member Logs`,
                iconURL: guild.iconURL() ?? "",
            })
            .setTitle(`${member.user.displayName} Joined`)
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
