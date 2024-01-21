import { Command } from "@sapphire/framework";

export class AvatarCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "avatar",
            description: "Get the avatar of a user",
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
                        .setDescription("The user to get the avatar of")
                )
                .addStringOption((option) =>
                    option
                        .setName("format")
                        .setDescription("The format of the avatar")
                        .addChoices(
                            {
                                name: "jpg",
                                value: "jpg",
                            },
                            {
                                name: "png",
                                value: "png",
                            },
                            {
                                name: "webp",
                                value: "webp",
                            },
                            {
                                name: "gif",
                                value: "gif",
                            },
                            {
                                name: "jpeg",
                                value: "jpeg",
                            }
                        )
                )
                .addNumberOption((option) =>
                    option
                        .setName("size")
                        .setDescription("The size of the avatar")
                        .addChoices(
                            {
                                name: "16",
                                value: 16,
                            },
                            {
                                name: "32",
                                value: 32,
                            },
                            {
                                name: "64",
                                value: 64,
                            },
                            {
                                name: "128",
                                value: 128,
                            },
                            {
                                name: "256",
                                value: 256,
                            },
                            {
                                name: "512",
                                value: 512,
                            },
                            {
                                name: "1024",
                                value: 1024,
                            },
                            {
                                name: "2048",
                                value: 2048,
                            },
                            {
                                name: "4096",
                                value: 4096,
                            }
                        )
                )
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const { options } = interaction;

        const user = options.getUser("user") ?? interaction.user;

        const format = options.getString("format") ?? "png";

        const size = options.getNumber("size") ?? 1024;

        const avatar = user.avatarURL({
            extension: format as any,
            size: size as any,
        });

        if (!avatar)
            return interaction.reply({
                content: "This user does not have an avatar",
                ephemeral: true,
            });

        const embed = this.container.util
            .embed()
            .setTitle(`${user.username}'s avatar`)
            .setImage(avatar);

        await interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    }
}
