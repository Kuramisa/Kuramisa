import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { KEmbed, logsChannel } from "@utils";
import { AuditLogEvent, ChannelType, Message } from "discord.js";

@KEvent({
    event: "messageDelete",
    description: "Logs when a message is deleted"
})
export default class Event extends AbstractKEvent {
    async run(message: Message) {
        if (!message.inGuild()) return;
        if (!message.author) return;
        if (message.author.id === this.client.user?.id) return;
        if (message.channel.type !== ChannelType.PrivateThread) return;

        // TODO: Implement message deletion logging

        const { guild } = message;
        const channel = await logsChannel(guild);
        if (!channel) return;

        const audit = await guild
            .fetchAuditLogs({
                type: AuditLogEvent.MessageDelete
            })
            .then((audit) => audit.entries.first());

        let title = `${message.author.globalName ?? message.author.username} deleted a message`;

        if (audit && audit.createdTimestamp === Date.now()) {
            const { executor: deletedBy } = audit;
            if (deletedBy) {
                title = `${title} by ${deletedBy.globalName ?? deletedBy.username}`;
            }
        }

        const attachments = message.attachments.toJSON();

        const embed = new KEmbed()
            .setAuthor({
                name: `${guild.name} Message Logs`,
                iconURL: guild.iconURL()!
            })
            .setThumbnail(
                message.author.avatarURL({ extension: "gif" }) as string
            )
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
