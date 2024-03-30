import { Command } from "@sapphire/framework";

export class AffectCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "affect",
            description: "This wont affect my baby!"
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
                        .setDescription("Person on the memeh")
                        .setRequired(true)
                )
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const {
            kanvas: { images }
        } = this.container;

        const { options } = interaction;

        const user = options.getUser("user", true);
        if (user.bot)
            return interaction.reply({
                content: "That user is a bot!",
                ephemeral: true
            });

        if (user.id === interaction.user.id)
            return interaction.reply({
                content: "Don't be mean to yourself!",
                ephemeral: true
            });

        const image = await images.affect(
            user.displayAvatarURL({ extension: "png", size: 512 })
        );

        return interaction.reply({
            files: [{ attachment: image, name: "affect.png" }]
        });
    }
}
