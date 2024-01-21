import { Command } from "@sapphire/framework";

export class ReportBugCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "reportbug",
            description: "Report a bug to the bot developers",
        });
    }

    override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addStringOption((option) =>
                    option
                        .setName("bug")
                        .setDescription("The bug you want to report")
                        .setRequired(true)
                )
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const { devReports, util } = this.container;

        const { options, user } = interaction;

        const bug = options.getString("bug", true);

        const embed = util
            .embed()
            .setTitle(`Report by ${user.username}`)
            .setDescription(`\`\`\`${bug}\`\`\``);

        if (!devReports || !devReports.isTextBased())
            return interaction.reply({
                content:
                    "The developers do not accept bug reports yet (We are so sorry)",
                ephemeral: true,
            });

        await devReports.send({ embeds: [embed] });

        await interaction.reply({
            content: "Your bug report has been sent to the developers!",
            ephemeral: true,
        });
    }
}
