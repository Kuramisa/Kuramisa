import { Command } from "@sapphire/framework";

export class SuggestCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "suggest",
            description:
                "Suggest features and other things to the Bot Developer"
        });
    }

    override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addStringOption((option) =>
                    option
                        .setName("suggestion")
                        .setDescription(
                            "The suggestion you want to send to the developers"
                        )
                        .setRequired(true)
                )
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const { devSuggestions, util } = this.container;

        const { options, user } = interaction;

        const suggestion = options.getString("suggestion", true);

        const embed = util
            .embed()
            .setTitle(`Suggestion by ${user.username}`)
            .setDescription(`\`\`\`${suggestion}\`\`\``);

        if (!devSuggestions || !devSuggestions.isTextBased())
            return interaction.reply({
                content:
                    "The developers do not accept suggestions yet (We are so sorry)",
                ephemeral: true
            });

        await devSuggestions.send({ embeds: [embed] });

        await interaction.reply({
            content: "Your suggestion has been sent to the developers!",
            ephemeral: true
        });
    }
}
