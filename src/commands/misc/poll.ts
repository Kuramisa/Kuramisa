import { Subcommand } from "@sapphire/plugin-subcommands";

export class PollCommand extends Subcommand {
    constructor(ctx: Subcommand.LoaderContext, opts: Subcommand.Options) {
        super(ctx, {
            ...opts,
            name: "poll",
            description: "Create/Manage a poll",
            subcommands: [
                {
                    name: "create",
                    chatInputRun: "chatInputCreate"
                }
            ]
        });
    }

    override registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName("create")
                        .setDescription("Create a poll")
                        .addStringOption((option) =>
                            option
                                .setName("poll_type")
                                .setDescription("Poll type you want to make")
                                .setRequired(true)
                                .addChoices(
                                    {
                                        name: "Emojis",
                                        value: "emojis"
                                    },
                                    {
                                        name: "Buttons",
                                        value: "buttons"
                                    }
                                )
                        )
                        .addStringOption((option) =>
                            option
                                .setName("question")
                                .setDescription("The question to ask")
                                .setRequired(true)
                        )
                        .addIntegerOption((option) =>
                            option
                                .setName("how_many")
                                .setDescription("How many answers to add")
                                .setRequired(true)
                                .setMinValue(1)
                                .setMaxValue(20)
                        )
                        .addStringOption((option) =>
                            option
                                .setName("duration")
                                .setDescription("The duration of the poll")
                        )
                        .addStringOption((option) =>
                            option
                                .setName("poll_description")
                                .setDescription("The description of the poll")
                        )
                )
        );
    }

    async chatInputCreate(interaction: Subcommand.ChatInputCommandInteraction) {
        const { options } = interaction;

        const pollType = options.getString("poll_type", true);

        const {
            systems: { poll }
        } = this.container;

        switch (pollType) {
            case "emojis":
                //await poll.createEmojiBased(interaction);
                await interaction.reply({
                    content: "This poll type is not yet implemented",
                    ephemeral: true
                });
                break;
            case "buttons":
                await poll.createButtonBased(interaction);
                break;
        }
    }
}
