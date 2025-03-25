import { Embed } from "Builders";
import { AbstractEvent, Event } from "classes/Event";
import type { GuildMember } from "discord.js";

@Event({
    event: "guildMemberAdd",
    description: "Logs when member joins the server",
})
export default class MemberJoinEvent extends AbstractEvent {
    async run(member: GuildMember) {
        const { guild } = member;

        const channel = await this.client.managers.guilds.logsChannel(guild);
        if (!channel) return;

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
