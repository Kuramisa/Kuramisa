import { Subcommand } from "@sapphire/plugin-subcommands";

export class FiltersCommand extends Subcommand {
    constructor(ctx: Subcommand.LoaderContext, opts: Subcommand.Options) {
        super(ctx, {
            ...opts,
            name: "contentfilter",
            description: "Content Filter system for your server",
            subcommands: [
                {
                    name: "messages",
                    chatInputRun: "chatInputMessages"
                },
                {
                    name: "media",
                    chatInputRun: "chatInputMedia"
                }
            ]
        });
    }

    override registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .setDefaultMemberPermissions(1 << 5)
                .addSubcommand((command) =>
                    command
                        .setName("messages")
                        .setDescription("Filter messages")
                        .addBooleanOption((option) =>
                            option
                                .setName("enabled")
                                .setDescription(
                                    "Enable (True) or disable (False) the filter"
                                )
                                .setRequired(true)
                        )
                )
                .addSubcommand((command) =>
                    command
                        .setName("media")
                        .setDescription("Filter media")
                        .addBooleanOption((option) =>
                            option
                                .setName("enabled")
                                .setDescription(
                                    "Enable (True) or disable (False) the filter"
                                )
                                .setRequired(true)
                        )
                )
        );
    }

    async chatInputMessages(
        interaction: Subcommand.ChatInputCommandInteraction
    ) {
        return interaction.reply({
            content: "For now, this command is disabled",
            ephemeral: true
        });

        if (!interaction.inCachedGuild()) return;
        const { database } = this.container;

        const { guild } = interaction;

        if (!guild?.members.me?.permissions.has("ManageMessages"))
            return interaction.reply({
                content: "I do not have the `ManageMessages` permission",
                ephemeral: true
            });

        const db = await database.guilds.fetch(guild.id);

        const enabled = interaction.options.getBoolean("enabled", true);

        db.filters.message.enabled = enabled;
        await db.save();

        await interaction.reply({
            content: `Message filter is now **${
                enabled ? "enabled" : "disabled"
            }**`,
            ephemeral: true
        });
    }

    async chatInputMedia(interaction: Subcommand.ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const { database } = this.container;

        const { guild } = interaction;

        if (!guild?.members.me?.permissions.has("ManageMessages"))
            return interaction.reply({
                content: "I do not have the `ManageMessages` permission",
                ephemeral: true
            });

        const db = await database.guilds.fetch(guild.id);

        const enabled = interaction.options.getBoolean("enabled", true);

        db.filters.media.enabled = enabled;
        await db.save();

        await interaction.reply({
            content: `Media filter is now **${
                enabled ? "enabled" : "disabled"
            }**`,
            ephemeral: true
        });
    }
}
