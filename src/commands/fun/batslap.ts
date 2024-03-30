import { Command } from "@sapphire/framework";

export class BatslapCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "batslap",
            description: "Batslap someone!"
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
                        .setDescription("Person you slapping")
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
                content: "You can't slap yourself!",
                ephemeral: true
            });

        const image = await images.batslap(
            interaction.user.displayAvatarURL({ extension: "png", size: 512 }),
            user.displayAvatarURL({ extension: "png", size: 512 })
        );

        return interaction.reply({
            files: [{ attachment: image, name: "batslap.png" }]
        });
    }
}
