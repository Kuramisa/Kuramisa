import { KModal, KModalRow, KTextInput } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import { ChatInputCommandInteraction, TextInputStyle } from "discord.js";

@SlashCommand({
    name: "eval",
    description: "Evaluate a piece of code",
    ownerOnly: true
})
export default class EvalCommand extends AbstractSlashCommand {
    async run(interaction: ChatInputCommandInteraction) {
        const modal = new KModal()
            .setCustomId("eval_modal")
            .setTitle("Evaluating JavaScript code")
            .setComponents(
                new KModalRow().setComponents(
                    new KTextInput()
                        .setCustomId("code")
                        .setLabel("Code")
                        .setStyle(TextInputStyle.Paragraph)
                )
            );

        await interaction.showModal(modal);

        const mInteraction = await interaction.awaitModalSubmit({ time: 0 });

        const code = mInteraction.fields.getTextInputValue("code");

        try {
            const evaled = eval(code);
            const clean = await this.client.clean(evaled);

            return mInteraction.reply({
                content: `\`\`\`js\n${clean}\n\`\`\``,
                ephemeral: true
            });
        } catch (error: any) {
            this.logger.error(error.message, { error });
            return mInteraction.reply({
                content: `\`\`\`xl\n${error}\n\`\`\``,
                ephemeral: true
            });
        }
    }
}
