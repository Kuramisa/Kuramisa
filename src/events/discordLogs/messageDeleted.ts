import { Embed } from "Builders";
import { AbstractEvent, Event } from "classes/Event";
import type { Message } from "discord.js";
import { AuditLogEvent } from "discord.js";

@Event({
    event: "messageDelete",
    description: "Logs when a message is deleted",
})
export default class MessageDeletedEvent extends AbstractEvent {
    async run(message: Message) {
        if (!message.inGuild()) return;
        if (message.author.bot) return;

        const { guild } = message;
        const channel =
            await this.container.client.managers.guilds.logsChannel(guild);
        if (!channel) return;

        const audit = await guild
            .fetchAuditLogs({
                type: AuditLogEvent.MessageDelete,
            })
            .then((audit) => audit.entries.first());

        let title = "Message was deleted";

        if (audit) {
            const { executor: deletedBy } = audit;
            if (deletedBy) title += ` by ${deletedBy.displayName}`;
        }

        title += ` that was sent by ${message.author.displayName}`;

        const attachments = message.attachments.toJSON();

        const embed = new Embed()
            .setAuthor({
                name: `${guild.name} Message Logs`,
                iconURL: guild.iconURL()!,
            })
            .setTitle(title)
            .setDescription(
                message.content.length > 0
                    ? `\n\`\`\`${message.content}\`\`\``
                    : null,
            )
            .setThumbnail(message.author.displayAvatarURL())
            .setFooter({ text: `ID: ${message.id}` });

        await channel.send({ embeds: [embed], files: attachments });
    }
}
