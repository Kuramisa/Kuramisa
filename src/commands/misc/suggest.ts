import {
    KEmbed,
    KModal,
    KModalRow,
    KStringOption,
    KTextInput
} from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import { ChatInputCommandInteraction, TextInputStyle } from "discord.js";

@SlashCommand({
    name: "suggest",
    description: "Suggest a feature to the developers",
    options: [
        new KStringOption()
            .setName("suggestion")
            .setDescription("The suggestion you want to make")
            .setRequired(false)
    ]
})
export default class SuggestCommand extends AbstractSlashCommand {
    async run(interaction: ChatInputCommandInteraction) {
        if (!this.client.suggestions)
            return interaction.reply({
                content: "Suggestions are disabled",
                ephemeral: true
            });

        const { options, user } = interaction;

        const suggestionStr = options.getString("suggestion");
        if (suggestionStr) {
            const embed = new KEmbed().setDescription(
                `\`\`\`${suggestionStr}\`\`\``
            );

            await this.client.suggestions.send({
                embeds: [
                    embed.setTitle(
                        `Suggestion by ${user.globalName ?? user.username}`
                    )
                ]
            });

            return interaction.reply({
                embeds: [embed.setTitle("Suggestion")],
                ephemeral: true
            });
        }

        const modal = new KModal()
            .setCustomId("suggest")
            .setTitle("Suggest a Feature")
            .addComponents(
                new KModalRow().setComponents(
                    new KTextInput()
                        .setCustomId("suggestion")
                        .setLabel("Suggestion")
                        .setPlaceholder("Describe the suggestion")

                        .setStyle(TextInputStyle.Paragraph)
                )
            );

        await interaction.showModal(modal);

        const mInteraction = await interaction.awaitModalSubmit({
            time: 0
        });

        const suggestion = mInteraction.fields.getTextInputValue("suggestion");

        const embed = new KEmbed().setDescription(`\`\`\`${suggestion}\`\`\``);

        await this.client.suggestions.send({
            embeds: [
                embed.setTitle(
                    `Suggestion by ${user.globalName ?? user.username}`
                )
            ]
        });

        await mInteraction.reply({
            embeds: [embed.setTitle("Suggestion")],
            ephemeral: true
        });
    }
}
