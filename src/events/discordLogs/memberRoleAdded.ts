import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { KEmbed } from "@builders";
import { logsChannel } from "@utils";
import { AuditLogEvent, GuildMember, Role } from "discord.js";

@KEvent({
    event: "guildMemberRoleAdd",
    description: "Logs when member has a role added"
})
export default class Event extends AbstractKEvent {
    async run(member: GuildMember, role: Role) {
        const { guild } = member;

        const channel = await logsChannel(guild);
        if (!channel) return;

        const audit = await guild
            .fetchAuditLogs({
                type: AuditLogEvent.MemberRoleUpdate
            })
            .then((audit) => audit.entries.first());

        let title = `${member.user.globalName ?? member.user.username} had a role added`;

        if (audit && audit.createdTimestamp === Date.now()) {
            const { executor: addedBy } = audit;
            if (addedBy) {
                title = `${title} by ${addedBy.globalName ?? addedBy.username}`;
            }
        }

        const embed = new KEmbed()
            .setAuthor({
                name: `${guild.name} Member Logs`,
                iconURL: guild.iconURL() ?? ""
            })
            .setTitle(title)
            .setThumbnail(member.displayAvatarURL())
            .setDescription(`${role} was added`);

        channel.send({ embeds: [embed] });
    }
}
