import { Command } from "@sapphire/framework";

export class InvertColorCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "invertcolor",
            description: "Invert someone's picture's color!",
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
                        .setDescription(
                            "Person to invert their picture's color"
                        )
                        .setRequired(true)
                )
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const {
            kanvas: { modify },
        } = this.container;

        const { options } = interaction;

        const user = options.getUser("user", true);

        if (user.bot)
            return interaction.reply({
                content: "That user is a bot!",
                ephemeral: true,
            });

        const image = await modify.invert(
            user.displayAvatarURL({ extension: "png", size: 512 })
        );

        return interaction.reply({
            files: [{ attachment: image, name: "invert.png" }],
        });
    }
}
