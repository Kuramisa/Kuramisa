import { Listener } from "@sapphire/framework";
import { AttachmentBuilder, ChannelType, Message } from "discord.js";
import _ from "lodash";

export class ChatGPTListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "Chat GPT",
            event: "messageCreate",
        });
    }

    async run(message: Message) {
        if (message.guild) {
            if (!message.guild.members.me?.permissions.has("SendMessages")) {
                await message.author
                    .send({
                        content:
                            "I do not have permission to send messages in this server.",
                    })
                    .catch(() => null);
            }
        }

        if (message.interaction !== null) return;

        if (message.channel.type === ChannelType.DM) return;

        const { client } = this.container;
        if (!client.user) return;
        const clientUser = client.users.cache.get(client.user.id);
        if (!clientUser) return;

        if (!message.content.includes(clientUser.id)) return;

        const content = message.content
            .replace(/<@\d+>/g, "")
            .replace(/<#\d+>/g, "")
            .replace(/<@&\d+>/g, "")
            .trim();

        const {
            logger,
            systems: { openai },
            util,
        } = this.container;

        logger.info(
            `Chat GPT: ${
                message.author.globalName
                    ? `${message.author.globalName} (${message.author.username})`
                    : `${message.author.username}`
            } (${
                message.author.id
            }) sent a message in with a prompt of \`${content}\``
        );

        await message.channel.sendTyping();

        const blacklistedKeywords = [
            "@everyone",
            "@here",
            "discord.gg",
            "discord.com",
            "discordapp.com",
            "porn",
            "nude",
            "naked",
            "sex",
        ];

        if (blacklistedKeywords.includes(content.toLowerCase())) {
            await message.channel.send(
                `${message.author} No, no, no. You cannot do that ^^`
            );
            return message.delete().catch(() => null);
        }

        const imageKeywords = ["show me", "image of", "picture of", "draw me"];

        if (
            imageKeywords.some((keyword) =>
                content.toLowerCase().includes(keyword)
            )
        ) {
            const imageContent = content
                .replaceAll(/show me/g, "")
                .replaceAll(/image of/g, "")
                .replaceAll(/picture of/g, "")
                .replaceAll(/draw me/g, "")
                .trim();

            const msg = await message
                .reply(`**Showing you an image of \`${imageContent}\`**`)
                .catch(() => null);

            if (!msg) return;

            const response = await openai
                .createImage(imageContent)
                .catch((err: any) => {
                    logger.error(err);
                    return null;
                });
            if (!response)
                return message
                    .reply(
                        `${message.author} No, no, no. You cannot do that ^^`
                    )
                    .catch(() => null);

            const attachment = new AttachmentBuilder(response, {
                name: `${imageContent.trim()}.png`,
            });

            await msg.edit({
                content: "",
                files: [attachment],
            });
        } else {
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

            if (response.length >= 2000) {
                await util.pagination
                    .texts(message, _.chunk(response, 1999).flat())
                    .catch(() => null);
            } else {
                await message.reply(response).catch(() => null);
            }
        }
    }
}
