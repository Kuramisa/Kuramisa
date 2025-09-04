import { Attachment, StringOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import type { Args } from "@sapphire/framework";
import { nekos } from "@utils";
import type { ChatInputCommandInteraction, Message } from "discord.js";
import {
    ApplicationIntegrationType,
    bold,
    InteractionContextType,
} from "discord.js";

@SlashCommand({
    name: "8ball",
    aliases: ["eightball", "8-ball"],
    description: "Ask the 8ball a question",
    contexts: [
        InteractionContextType.Guild,
        InteractionContextType.BotDM,
        InteractionContextType.PrivateChannel,
    ],
    integrations: [
        ApplicationIntegrationType.GuildInstall,
        ApplicationIntegrationType.UserInstall,
    ],
    opts: [
        new StringOption()
            .setName("question")
            .setDescription("The question to ask the 8ball"),
    ],
})
export default class EightBallCommand extends AbstractSlashCommand {
    async messageRun(message: Message, args: Args) {
        let question = await args.rest("string").catch(() => null);
        if (!question)
            return message.reply({
                content: "Please provide a question to ask the 8ball",
            });

        if (!question.includes("?")) question += "?";

        const { author } = message;

        const { url, response } = await nekos.eightBall({
            text: question,
        });

        if (url) {
            const attachment = new Attachment(url, {
                name: `8ball-answer.png`,
            });

            return message.reply({
                content: `${author}: ${bold(question)}`,
                files: [attachment],
                flags: "SuppressNotifications",
            });
        }

        return message.reply({
            content: `${author}: ${bold(question)}\n${response}`,
            flags: "SuppressNotifications",
        });
    }

    async chatInputRun(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction;

        let question = options.getString("question", true);
        if (!question.includes("?")) question += "?";

        const { url, response } = await nekos.eightBall({
            text: question,
        });

        if (url) {
            const attachment = new Attachment(url, {
                name: `8ball-answer.png`,
            });

            return interaction.reply({
                content: `${user}: ${bold(question)}`,
                files: [attachment],
                flags: "SuppressNotifications",
            });
        }

        return interaction.reply({
            content: `${user}: ${bold(question)}\n${response}`,
            flags: "SuppressNotifications",
        });
    }
}
