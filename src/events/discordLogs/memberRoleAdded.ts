import { Embed } from "Builders";
import { AbstractEvent, Event } from "classes/Event";
import type { GuildMember, Role } from "discord.js";
import { AuditLogEvent } from "discord.js";

@Event({
    event: "guildMemberRoleAdd",
    description: "Logs when member has a role added",
})
export default class MemberRoleAddEvent extends AbstractEvent {
    async run(member: GuildMember, role: Role) {
        const { guild } = member;

        const channel = await this.client.managers.guilds.logsChannel(guild);
        if (!channel) return;

        const audit = await guild
            .fetchAuditLogs({
                type: AuditLogEvent.MemberRoleUpdate,
            })
            .then((audit) => audit.entries.first());

        let title = `${member.user.displayName} had a role added`;

        if (audit && audit.changes[0].key === "$add") {
            const { executor: addedBy } = audit;
            if (addedBy) {
                title = `${title} by ${addedBy.displayName}`;
            }
        }

        const embed = new Embed()
            .setAuthor({
                name: `${guild.name} Member Logs`,
                iconURL: guild.iconURL() ?? "",
            })
            .setTitle(title)
            .setThumbnail(member.displayAvatarURL())
            .setDescription(`${role} was added`);

        await channel.send({ embeds: [embed] });
    }
}
