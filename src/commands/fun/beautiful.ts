import { Command } from "@sapphire/framework";

export class BeautifulCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "beautiful",
            description: "Beautiful someone!",
        });
    }

    override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addUserOption((option) =>
                    option
                        .setName("user")
                        .setDescription("Person you beautiful")
                        .setRequired(true)
                )
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const {
            kanvas: { images },
        } = this.container;

        const { options } = interaction;

        const user = options.getUser("user", true);

        if (user.bot)
            return interaction.reply({
                content: "That user is a bot!",
                ephemeral: true,
            });

        if (user.id === interaction.user.id)
            return interaction.reply({
                content: "Kind of narcissistic, don't you think?",
                ephemeral: true,
            });

        const image = await images.beautiful(
            user.displayAvatarURL({ extension: "png", size: 512 })
        );

        return interaction.reply({
            files: [{ attachment: image, name: "beautiful.png" }],
        });
    }
}
