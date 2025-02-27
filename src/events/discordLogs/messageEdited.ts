import { Embed } from "@builders";
import { AbstractEvent, Event } from "classes/Event";
import { logsChannel } from "utils";
import { Message } from "discord.js";
import { isEqual } from "lodash";

@Event({
    event: "messageUpdate",
    description: "Logs when a message is deleted",
})
export default class MessageEditedEvent extends AbstractEvent {
    async run(oldMessage: Message, newMessage: Message) {
        if (!newMessage.inGuild()) return;
        if (!newMessage.author) return;
        if (!oldMessage.content && !newMessage.content) return;
        if (
            oldMessage.content === newMessage.content &&
            isEqual(oldMessage.attachments, newMessage.attachments)
        )
            return;
        if (newMessage.author.id === this.client.user?.id) return;

        const { guild } = newMessage;

        const channel = await logsChannel(guild);
        if (!channel) return;

        const { content: oldContent } = oldMessage;

        const { attachments: newAttachments, content: newContent } = newMessage;

        const fromContent =
            oldContent && oldContent.length > 0
                ? `***From***\n\`\`\`${oldContent}\`\`\``
                : "";

        const toContent =
            newContent && newContent.length > 0
                ? `***To***\n\`\`\`${newContent}\`\`\``
                : "";

        const attachments = newAttachments.toJSON();

        const embed = new Embed()
            .setAuthor({
                name: `${guild.name} Message Logs`,
                iconURL: guild.iconURL() ?? undefined,
            })
            .setTitle(`${newMessage.author.username} edited a message`)
            .setThumbnail(newMessage.author.avatarURL({ extension: "gif" }))
            .setDescription(`${fromContent}\n${toContent}`)
            .setFooter({ text: `ID: ${newMessage.id}` });

        channel.send({ embeds: [embed], files: attachments });
    }
}
