import { Listener } from "@sapphire/framework";
import { AuditLogEvent, ChannelType, Message } from "discord.js";

export class MessageDeletedLogListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "Logs when a message is deleted",
            event: "messageDelete",
        });
    }

    async run(message: Message) {
        if (!message.inGuild()) return;
        if (!message.author) return;
        if (message.author.id === this.container.client.user?.id) return;
        if (message.channel.type === ChannelType.PrivateThread) return;

        const { database, util } = this.container;

        const { guild } = message;

        const db = await database.guilds.fetch(guild.id);
        if (!db || !db.logs.channel || !db.logs.types.messageDeleted) return;

        const channel = guild.channels.cache.get(db.logs.channel);
        if (!channel || !channel.isTextBased()) return;

        const attachments = message.attachments.toJSON();

        if (!guild.members.me?.permissionsIn(channel).has("SendMessages"))
            return;

        const audit = (
            await guild.fetchAuditLogs({
                type: AuditLogEvent.MessageDelete,
            })
        ).entries.first();

        if (!audit) return;

        const { executor: deletedBy, createdTimestamp } = audit;

        let title = `${message.author.username}'s message was deleted`;

        if (createdTimestamp === Date.now())
            title = `${message.author.username}'s message was deleted by ${deletedBy?.username}`;

        const embed = util
            .embed()
            .setAuthor({
                name: `${guild.name} Message Logs`,
                iconURL: guild.iconURL()!,
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

        return channel.send({
            embeds: [embed],
            files: attachments,
        });
    }
}
