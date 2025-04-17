import { Embed } from "Builders";
import { AbstractEvent, Event } from "classes/Event";
import type { Message } from "discord.js";
import { messageLink } from "discord.js";
import isEqual from "lodash/isEqual";

@Event({
    event: "messageUpdate",
    description: "Logs when a message is deleted",
})
export default class MessageEditedEvent extends AbstractEvent {
    async run(oldMessage: Message, newMessage: Message) {
        if (!newMessage.inGuild()) return;
        if (!oldMessage.content && !newMessage.content) return;
        if (
            oldMessage.content === newMessage.content &&
            isEqual(oldMessage.attachments, newMessage.attachments)
        )
            return;
        if (newMessage.author.id === newMessage.client.user.id) return;
        if (newMessage.author.bot) return;

        const {
            client: { managers },
            guild,
        } = newMessage;

        const channel = await managers.guilds.logsChannel(guild);
        if (!channel) return;

        const db = await managers.guilds.get(guild.id);
        if (!db.logs.types.messageEdited) return;

        const { content: oldContent } = oldMessage;
        const { content: newContent } = newMessage;

        const fromContent =
            oldContent && oldContent.length > 0
                ? `***From***\n\`\`\`${oldContent}\`\`\``
                : "";

        const toContent =
            newContent && newContent.length > 0
                ? `***To***\n\`\`\`${newContent}\`\`\``
                : "";

        const embed = new Embed()
            .setAuthor({
                name: `${guild.name} Message Logs`,
                iconURL: guild.iconURL() ?? undefined,
            })
            .setTitle(`${newMessage.author.displayName} edited a message`)
            .setThumbnail(newMessage.author.displayAvatarURL())
            .setDescription(
                `**Channel**: ${messageLink(newMessage.channelId, newMessage.id)}\n\n${fromContent}\n${toContent}`,
            )
            .setFooter({ text: `ID: ${newMessage.id}` });

        await channel.send({ embeds: [embed] });
    }
}
