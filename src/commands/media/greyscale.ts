import { Command } from "@sapphire/framework";

export class GreyscaleCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "greyscale",
            description: "Make someone's picture greyscale!"
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
                            "Person to make their picture greyscale"
                        )
                        .setRequired(true)
                )
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const {
            kanvas: { modify }
        } = this.container;

        const { options } = interaction;

        const user = options.getUser("user", true);

        if (user.bot)
            return interaction.reply({
                content: "That user is a bot!",
                ephemeral: true
            });

        const image = await modify.greyscale(
            user.displayAvatarURL({ extension: "png", size: 512 })
        );

        return interaction.reply({
            files: [{ attachment: image, name: "greyscale.png" }]
        });
    }
}
