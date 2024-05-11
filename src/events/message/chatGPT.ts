import { KAttachment } from "@builders";
import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { Pagination } from "@utils";
import { Message } from "discord.js";
import { chunk } from "lodash";

@KEvent({
    event: "messageCreate",
    description: "Chat GPT"
})
export default class Event extends AbstractKEvent {
    async run(message: Message) {
        if (message.author.bot) return;
        if (message.interaction !== null) return;

        const {
            logger,
            systems: { openai }
        } = this.client;

        if (!this.client.user) return;

        const { content: msgContent, channel, guild } = message;
        const { user: clientUser } = this.client;

        if (guild) {
            if (!msgContent.includes(clientUser.id)) return;
            if (!guild.members.me?.permissions.has("SendMessages"))
                return message.author
                    .send({
                        content:
                            "I do not have permission to send messages in this server."
                    })
                    .catch(() => null);
        }

        await channel.sendTyping();

        const content = msgContent
            .replace(/<@\d+>/g, "")
            .replace(/<#\d+>/g, "")
            .replace(/<@&\d+>/g, "")
            .trim();

        if (guild) {
            logger.info(
                `Chat GPT: ${
                    message.author.globalName
                        ? `${message.author.globalName} (${message.author.username})`
                        : `${message.author.username}`
                } (${
                    message.author.id
                }) sent a message in with a prompt of \`${content}\``
            );
        } else {
            logger.info(
                `Chat GPT: ${
                    message.author.globalName
                        ? `${message.author.globalName} (${message.author.username})`
                        : `${message.author.username}`
                } (${
                    message.author.id
                }) sent a message in DMs with a prompt of \`${content}\``
            );
        }

        const blacklistedKeywords = [
            "@everyone",
            "@here",
            "discord.gg",
            "discord.com",
            "discordapp.com",
            "porn",
            "nude",
            "naked",
            "sex"
        ];

        if (blacklistedKeywords.includes(content.toLowerCase())) {
            await message.channel
                .send(`${message.author} No, no, no. You cannot do that ^^`)
                .then((msg) => {
                    if (message.guild) {
                        setTimeout(() => {
                            msg.delete().catch(() => null);
                        }, 5000);
                    }
                });

            if (message.guild) await message.delete();

            return;
        }

        const imageKeywords = [
            "show me",
            "image of",
            "picture of",
            "draw me",
            "an image of",
            "a picture of",
            "a drawing of",
            "a photo of",
            "a photograph of",
            "a photo of"
        ];

        if (
            imageKeywords.some((keyword) =>
                content.toLowerCase().includes(keyword)
            )
        ) {
            const imageContent = content
                .replace(
                    imageKeywords.find((keyword) =>
                        content.toLowerCase().includes(keyword)
                    ) ?? "",
                    ""
                )
                .trim();

            const msg = await message
                .reply(`**Showing you \`${imageContent}\`**`)
                .catch(() => null);

            if (!msg) return;

            const response = await openai
                .createImage(imageContent)
                .catch(() => null);
            if (!response)
                return message
                    .reply(
                        `${message.author} No, no, no. You cannot do that ^^`
                    )
                    .catch(() => null);

            const attachment = new KAttachment(response, {
                name: `${imageContent.trim()}.png`
            });

            return msg.edit({
                content: "",
                files: [attachment]
            });
        }
        const response = await openai.createChat(
            content,
            message.author.id,
            message.author.globalName ?? message.author.username
        );
        if (!response) return message.reply("No response from OpenAI");

        if (blacklistedKeywords.includes(response.toLowerCase())) {
            await message.channel.send(
                `${message.author} No, no, no. You cannot do that ^^`
            );
            return message.delete();
        }

        if (response.length >= 2000)
            return Pagination.texts(
                message,
                chunk(response, 1999).flat()
            ).catch(() => null);

        message.reply(response).catch(() => null);
    }
}
