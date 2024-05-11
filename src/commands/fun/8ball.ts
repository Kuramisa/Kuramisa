import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import { nekos } from "@utils";
import { KAttachment } from "@builders";
import {
    ChatInputCommandInteraction,
    SlashCommandStringOption
} from "discord.js";

@SlashCommand({
    name: "8ball",
    description: "Ask the magic 8ball a question",
    ownerOnly: true,
    options: [
        new SlashCommandStringOption()
            .setName("question")
            .setDescription("The question you want to ask the 8ball")
            .setRequired(true)
    ]
})
export default class PingCommand extends AbstractSlashCommand {
    async run(interaction: ChatInputCommandInteraction) {
        const { options } = interaction;

        let question = options.getString("question", true);

        if (!question.includes("?")) question += "?";

        const { url, response } = await nekos.eightBall({
            text: question
        });

        if (url) {
            const attachment = new KAttachment(url, {
                name: `8ball-answer-${question.trim()}.png`
            });

            return interaction.reply({
                content: `${interaction.user}: **${question}**`,
                files: [attachment],
                allowedMentions: { repliedUser: false, users: [] }
            });
        }

        await interaction.reply(response);
    }
}
