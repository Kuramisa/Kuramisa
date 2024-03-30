import { Command } from "@sapphire/framework";

export class DarkenCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "darken",
            description: "Darken someone's picture!"
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
                        .setDescription("Person to darken their picture")
                        .setRequired(true)
                )
                .addNumberOption((option) =>
                    option
                        .setName("intensity")
                        .setDescription("Intensity of the darkening")
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

        const intensity = options.getNumber("intensity", true);

        const image = await modify.darkness(
            user.displayAvatarURL({ extension: "png", size: 512 }),
            intensity
        );

        return interaction.reply({
            files: [{ attachment: image, name: "darken.png" }]
        });
    }
}
