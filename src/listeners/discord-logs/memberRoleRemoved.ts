import { Listener } from "@sapphire/framework";
import { Embed } from "Builders";
import type { GuildMember, Role } from "discord.js";
import { AuditLogEvent } from "discord.js";

export default class MemberRoleRemovedEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "guildMemberRoleRemove",
            name: "member-role-remove",
            description: "Logs when member has a role removed",
        });
    }

    async run(member: GuildMember, role: Role) {
        const {
            client: { managers },
            guild,
        } = member;

        const channel = await managers.guilds.logsChannel(guild);
        if (!channel) return;

        const db = await managers.guilds.get(guild.id);
        if (!db.logs.types.memberRoleRemoved) return;

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
