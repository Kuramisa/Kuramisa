import { Subcommand } from "@sapphire/plugin-subcommands";
import _ from "lodash";

export class HelpCommand extends Subcommand {
    constructor(ctx: Subcommand.LoaderContext, opts: Subcommand.Options) {
        super(ctx, {
            ...opts,
            name: "help",
            description: "View what categories/commands offer",
            subcommands: [
                {
                    name: "all",
                    chatInputRun: "chatInputAll",
                },
                {
                    name: "category",
                    chatInputRun: "chatInputCategory",
                },
                {
                    name: "command",
                    chatInputRun: "chatInputCommand",
                },
            ],
        });
    }

    /**
     * Register Slash Command
     */
    override registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addSubcommand((command) =>
                    command
                        .setName("all")
                        .setDescription("Look at all commands")
                )
                .addSubcommand((command) =>
                    command
                        .setName("category")
                        .setDescription("View certain category")
                        .addStringOption((option) =>
                            option
                                .setName("category")
                                .setDescription("Category to view")
                                .setAutocomplete(true)
                                .setRequired(true)
                        )
                )
                .addSubcommand((command) =>
                    command
                        .setName("command")
                        .setDescription("View certain commands")
                        .addStringOption((option) =>
                            option
                                .setName("command")
                                .setDescription("Command to view")
                                .setAutocomplete(true)
                                .setRequired(true)
                        )
                )
        );
    }

    /**
     * Execute Slash Subcommand (All)
     */
    async chatInputAll(interaction: Subcommand.ChatInputCommandInteraction) {
        const { client, util, stores } = this.container;

        const categories = stores.get("commands").categories;

        const description = categories
            .sort((a, b) => a.localeCompare(b))
            .map((category) => {
                const commands = stores
                    .get("commands")
                    .filter((command) => command.fullCategory[0] === category)
                    .map(
                        (command) =>
                            `**${command.name}** - \`${command.description}\``
                    );

                return `${_.capitalize(category)}\n${commands.join("\n")}`;
            })
            .join("\n\n");

        const avatar = client.user?.displayAvatarURL();

        const embed = util
            .embed()
            .setTitle(`${client.user?.username} Help`)
            .setDescription(description);
        if (avatar) embed.setThumbnail(avatar);

        return interaction.reply({ embeds: [embed] });
    }

    /**
     * Execute Slash Subcommand (Category)
     */
    async chatInputCategory(
        interaction: Subcommand.ChatInputCommandInteraction
    ) {
        const { options } = interaction;
        const { client, util, stores } = this.container;

        const categoryId = options.getString("category", true);
        const category = stores
            .get("commands")
            .filter((command) => command.fullCategory[0] === categoryId);

        if (!category)
            return interaction.reply({
                content: "Category not found",
                ephemeral: true,
            });

        const commands = category
            .map(
                (command) => `**${command.name}** - \`${command.description}\``
            )
            .join("\n");

        const avatar = client.user?.displayAvatarURL();

        const embed = util
            .embed()
            .setTitle(`${category.random()?.fullCategory[0]} Category`)
            .setDescription(commands);
        if (avatar) embed.setThumbnail(avatar);

        return interaction.reply({ embeds: [embed] });
    }

    /**
     * Execute Slash Subcommand (Command)
     */
    async chatInputCommand(
        interaction: Subcommand.ChatInputCommandInteraction
    ) {
        const { client, util, stores } = this.container;
        const { options } = interaction;

        const commandName = options.getString("command", true);
        const command = stores.get("commands").get(commandName);

        if (!command)
            return interaction.reply({
                content: "Command not found",
                ephemeral: true,
            });

        const avatar = client.user?.displayAvatarURL();

        const embed = util
            .embed()
            .setTitle(`${command.name} Command`)
            .setDescription(command.description)
            .setFields(
                {
                    name: "Category",
                    value: `${_.capitalize(command.fullCategory[0])}`,
                    inline: true,
                },
                {
                    name: "Permissions",
                    value: command.options.requiredUserPermissions
                        ? `${command.options.requiredUserPermissions}`
                        : "Everyone",
                    inline: true,
                }
            );

        if (avatar) embed.setThumbnail(avatar);

        return interaction.reply({ embeds: [embed] });
    }
}
