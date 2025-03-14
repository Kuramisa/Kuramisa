import { Embed } from "@builders";
import { AbstractEvent, Event } from "classes/Event";
import { logsChannel } from "utils";
import { AuditLogEvent, Message } from "discord.js";

@Event({
    event: "messageDelete",
    description: "Logs when a message is deleted",
})
export default class MessageDeletedEvent extends AbstractEvent {
    async run(message: Message) {
        if (!message.inGuild()) return;

        const { guild } = message;
        const channel = await logsChannel(guild);
        if (!channel) return;

        const audit = await guild
            .fetchAuditLogs({
                type: AuditLogEvent.MessageDelete,
            })
            .then((audit) => audit.entries.first());

        let title = "Message was deleted";

        if (audit) {
            const { target, executor: deletedBy } = audit;
            if (deletedBy) {
                title += ` by ${deletedBy.globalName ?? deletedBy.username}`;
            }
            if (target) {
                title += ` that was sent by ${target.globalName ?? target.username}`;
            }
        }

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
                    : ""
            )
            .setFooter({ text: `ID: ${message.id}` });

        channel.send({ embeds: [embed], files: attachments });
    }
}
