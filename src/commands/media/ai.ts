import { KAttachment, KStringOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import { Pagination } from "@utils";
import { ChatInputCommandInteraction } from "discord.js";
import { chunk } from "lodash";

@SlashCommand({
    name: "ai",
    description: "Kuramisa AI",
    subcommands: [
        {
            name: "chat",
            description: "Chat with Kuramisa AI",
            options: [
                new KStringOption()
                    .setName("message")
                    .setDescription("Message to send to the AI")
            ]
        },
        {
            name: "image",
            description: "Generate an image with Kuramisa AI",
            options: [
                new KStringOption()
                    .setName("prompt")
                    .setDescription("Prompt for the AI")
            ]
        }
    ]
})
export default class AICommand extends AbstractSlashCommand {
    async slashChat(interaction: ChatInputCommandInteraction) {
        const {
            systems: { openai }
        } = this.client;

        const { options, user } = interaction;

        const message = options.getString("message", true);

        await interaction.deferReply();

        const response = await openai.createChat(
            message,
            user.id,
            user.globalName ?? user.username
        );
        if (!response)
            return await interaction.editReply("No response from AI");
        if (response.length > 2000)
            return await Pagination.embedContents(
                interaction,
                chunk(response, 4)
            );
        await interaction.editReply(response);
    }

    async slashImage(interaction: ChatInputCommandInteraction) {
        const {
            systems: { openai },
            logger
        } = this.client;

        const prompt = interaction.options.getString("prompt", true).trim();

        await interaction.reply(
            `**Generating an image with the prompt \`${prompt}\`...**`
        );

        try {
            const response = await openai.createImage(prompt);
            if (!response)
                return await interaction.editReply("No response from AI");

            const attachment = new KAttachment(response, {
                name: `${prompt.trim()}.png`
            });

            await interaction.editReply({
                content: `**${prompt.trim()}**`,
                files: [attachment]
            });
        } catch (error: any) {
            if (error.response) {
                logger.error(`Prompt: ${prompt}`, { error });
                await interaction.editReply(error.response.data.error.message);
            } else {
                logger.error(`Prompt: ${prompt}`, { error });
                await interaction.editReply(error.message);
            }
        }
    }
}
