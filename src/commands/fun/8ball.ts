import { Attachment, StringOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "classes/SlashCommand";
import {
    ApplicationIntegrationType,
    bold,
    ChatInputCommandInteraction,
    InteractionContextType,
} from "discord.js";
import { nekos } from "utils";

@SlashCommand({
    name: "8ball",
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
    options: [
        new StringOption()
            .setName("question")
            .setDescription("The question to ask the 8ball"),
    ],
})
export default class EightBallCommand extends AbstractSlashCommand {
    async run(interaction: ChatInputCommandInteraction) {
        let question = interaction.options.getString("question", true);
        if (!question.includes("?")) question += "?";

        const { url, response } = await nekos.eightBall({
            text: question,
        });

        if (url) {
            const attachment = new Attachment(url, {
                name: `8ball-answer.png`,
            });

            return interaction.reply({
                content: `${interaction.user}: ${bold(question)}`,
                files: [attachment],
                flags: ["SuppressNotifications"],
            });
        }

        return interaction.reply({
            content: `${interaction.user}: ${bold(question)}\n${response}`,
            flags: ["SuppressNotifications"],
        });
    }
}
