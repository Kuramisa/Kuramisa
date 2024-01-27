import { Command } from "@sapphire/framework";
import { AttachmentBuilder } from "discord.js";

export class LeaderboardCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "leaderboard",
            description: "View Global Leadeboard",
        });
    }

    override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addNumberOption((option) =>
                    option
                        .setName("user_count")
                        .setDescription("How many users do you want to see?")
                        .setMinValue(5)
                        .setMaxValue(25)
                )
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const { kanvas } = this.container;
        const { options } = interaction;

        const count = options.getNumber("user_count") ?? 10;

        await interaction.deferReply();

        const leaderboard = await kanvas.member.leaderboard(count);

        const attachment = new AttachmentBuilder(leaderboard, {
            name: `leaderboard-${count}.png`,
        });

        await interaction.editReply({
            files: [attachment],
        });
    }
}
