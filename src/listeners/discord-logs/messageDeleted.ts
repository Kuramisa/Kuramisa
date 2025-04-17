import { Listener } from "@sapphire/framework";
import { Embed } from "Builders";
import type { Message } from "discord.js";
import { AuditLogEvent } from "discord.js";

export default class MessageDeletedEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "messageDelete",
            description: "Logs when a message is deleted",
        });
    }

    async run(message: Message) {
        if (!message.inGuild()) return;
        if (message.author.bot) return;

        const {
            client: { managers },
            guild,
        } = message;

        const channel = await managers.guilds.logsChannel(guild);
        if (!channel) return;

        const db = await managers.guilds.get(guild.id);
        if (!db.logs.types.messageDeleted) return;

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
