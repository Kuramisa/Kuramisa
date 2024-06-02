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
    name: "report-bug",
    description: "Report a bug to the developers",
    options: [
        new KStringOption()
            .setName("bug")
            .setDescription("The bug you want to report")
            .setRequired(false)
    ]
})
export default class PingCommand extends AbstractSlashCommand {
    async run(interaction: ChatInputCommandInteraction) {
        if (!this.client.bugReports)
            return interaction.reply({
                content: "Bug reports are disabled",
                ephemeral: true
            });

        const { options, user } = interaction;

        const { bugReports } = this.client;

        const bugStr = options.getString("bug");
        if (bugStr) {
            const embed = new KEmbed().setDescription(`\`\`\`${bugStr}\`\`\``);

            await bugReports.send({
                embeds: [
                    embed.setTitle(
                        `Report by ${user.globalName ?? user.username}`
                    )
                ]
            });

            return interaction.reply({
                embeds: [embed.setTitle("Bug Report")],
                ephemeral: true
            });
        }

        const modal = new KModal()
            .setCustomId("report-bug")
            .setTitle("Report a Bug")
            .addComponents(
                new KModalRow().setComponents(
                    new KTextInput()
                        .setCustomId("bug")
                        .setLabel("Bug")
                        .setPlaceholder("Describe the bug")

                        .setStyle(TextInputStyle.Paragraph)
                )
            );

        await interaction.showModal(modal);

        const mInteraction = await interaction.awaitModalSubmit({
            time: 0
        });

        const bug = mInteraction.fields.getTextInputValue("bug");

        const embed = new KEmbed().setDescription(`\`\`\`${bug}\`\`\``);

        await bugReports.send({
            embeds: [
                embed.setTitle(`Report by ${user.globalName ?? user.username}`)
            ]
        });

        await mInteraction.reply({
            embeds: [embed.setTitle("Bug Report")],
            ephemeral: true
        });
    }
}
