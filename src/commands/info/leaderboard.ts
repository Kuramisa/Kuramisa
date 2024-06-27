import { KAttachment, KNumberOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import { ChatInputCommandInteraction } from "discord.js";

@SlashCommand({
    name: "leaderboard",
    description: "View Global Leaderboard",
    options: [
        new KNumberOption()
            .setName("user_count")
            .setDescription("The number of users to show")
            .setMinValue(5)
            .setMaxValue(25)
    ]
})
export default class LeaderboardCommand extends AbstractSlashCommand {
    async run(interaction: ChatInputCommandInteraction) {
        const { kanvas } = this.client;
        const { options } = interaction;

        const count = options.getNumber("user_count") ?? 10;

        await interaction.deferReply();

        const leaderboard = await kanvas.member.leaderboard(count);

        const attachment = new KAttachment(leaderboard, {
            name: `leaderboard-${count}.png`
        });

        await interaction.editReply({
            files: [attachment]
        });
    }
}
