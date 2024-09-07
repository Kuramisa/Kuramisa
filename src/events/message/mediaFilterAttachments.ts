import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { conj } from "@utils";
import { Message } from "discord.js";

@KEvent({
    event: "messageCreate",
    description: "Filter media in messages"
})
export default class MediaFilterAttachmentsEvent extends AbstractKEvent {
    async run(message: Message) {
        if (message.channel.isDMBased()) return;
        if (message.attachments.size < 1) return;
        if (!message.guild) return;

        const { moderation, managers } = this.client;

        const dbGuild = await managers.guilds.get(message.guild.id);
        if (!dbGuild.filters.media.enabled) return;

        const reasonsArr: string[][] = [];

        for (const attachment of message.attachments.values()) {
            if (!attachment.contentType) return;
            if (attachment.contentType.includes("image")) {
                reasonsArr.push(await moderation.image(attachment.url));
            } else if (attachment.contentType.includes("video")) {
                reasonsArr.push(await moderation.video(attachment.url));
            }
        }

        const reasons = [...new Set(reasonsArr.flat())];

        if (reasons.length < 1) return;

        await message.delete().catch(() => null);

        message.channel.send({
            content: `**${message.author}, your message was deleted because it contained: \`${conj(reasons)}\`**`
        });
    }
}
