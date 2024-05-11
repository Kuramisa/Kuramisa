import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { KEmbed, logsChannel } from "@utils";
import { AuditLogEvent, GuildMember, Role } from "discord.js";

@KEvent({
    event: "guildMemberRoleRemove",
    description: "Logs when member has a role removed"
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

        let title = `${member.user.globalName ?? member.user.username} had a role removed`;

        if (audit && audit.createdTimestamp === Date.now()) {
            const { executor: removedBy } = audit;
            if (removedBy) {
                title = `${title} by ${removedBy.globalName ?? removedBy.username}`;
            }
        }

        const embed = new KEmbed()
            .setAuthor({
                name: `${guild.name} Member Logs`,
                iconURL: guild.iconURL() ?? ""
            })
            .setTitle(title)
            .setThumbnail(member.displayAvatarURL())
            .setDescription(`${role} was removed`);

        channel.send({ embeds: [embed] });
    }
}
