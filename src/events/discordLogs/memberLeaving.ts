import { AbstractEvent, Event } from "classes/Event";
import { Embed } from "@builders";
import { logsChannel } from "utils";
import { GuildMember } from "discord.js";

@Event({
    event: "guildMemberRemove",
    description: "Logs when member leaves the server",
})
export default class MemberLeaveEvent extends AbstractEvent {
    async run(member: GuildMember) {
        const { guild } = member;

        const channel = await logsChannel(guild);
        if (!channel) return;

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
                    member.user.createdTimestamp / 1000
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

        channel.send({ embeds: [embed] });
    }
}
