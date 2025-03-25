import { Embed } from "Builders";
import { AbstractEvent, Event } from "classes/Event";
import type { GuildMember, Role } from "discord.js";
import { AuditLogEvent } from "discord.js";

@Event({
    event: "guildMemberRoleRemove",
    description: "Logs when member has a role removed",
})
export default class MemberRoleRemovedEvent extends AbstractEvent {
    async run(member: GuildMember, role: Role) {
        const { guild } = member;

        const channel = await this.client.managers.guilds.logsChannel(guild);
        if (!channel) return;

        const audit = await guild
            .fetchAuditLogs({
                type: AuditLogEvent.MemberRoleUpdate,
            })
            .then((audit) => audit.entries.first());

        let title = `${member.user.displayName} had a role removed`;

        if (audit && audit.changes[0].key === "$remove") {
            const { executor: removedBy } = audit;
            if (removedBy) {
                title = `${title} by ${removedBy.displayName}`;
            }
        }

        const embed = new Embed()
            .setAuthor({
                name: `${guild.name} Member Logs`,
                iconURL: guild.iconURL() ?? "",
            })
            .setTitle(title)
            .setThumbnail(member.displayAvatarURL())
            .setDescription(`${role} was removed`);

        await channel.send({ embeds: [embed] });
    }
}
