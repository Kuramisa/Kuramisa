import { Command } from "@sapphire/framework";

export class NotificationsCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "notifications",
            description: "Notification System"
        });
    }

    override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addSubcommand((command) =>
                    command
                        .setName("bot_announcements")
                        .setDescription("Bot announcements")
                        .addBooleanOption((option) =>
                            option
                                .setName("enabled")
                                .setDescription(
                                    "Enable (True) or disable (False) this type of notification"
                                )
                                .setRequired(true)
                        )
                )
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const { database } = this.container;

        const { options, user } = interaction;

        const db = await database.users.fetch(user.id);

        const enabled = options.getBoolean("enabled", true);

        switch (options.getSubcommand()) {
            case "bot_announcements":
                db.notifications.botAnnouncements = enabled;
                await db.save();
                await interaction.reply({
                    content: `Bot announcements have been ${
                        enabled ? "enabled" : "disabled"
                    }`,
                    ephemeral: true
                });
                break;
        }
    }
}
