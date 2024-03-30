import { Command } from "@sapphire/framework";
import { ComponentType } from "discord.js";
import { capitalize } from "lodash";

export class LogsCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "logs",
            description: "Configure logs for your channel",
            requiredUserPermissions: "ManageGuild"
        });
    }

    override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .setDMPermission(false)
                .setDefaultMemberPermissions(1 << 5)
                .addSubcommand((command) =>
                    command
                        .setName("channel")
                        .setDescription("Set a Channel to send logs to")
                        .addChannelOption((option) =>
                            option
                                .setName("text_channel")
                                .setDescription("Channel to set")
                                .addChannelTypes(0)
                                .setRequired(true)
                        )
                )
                .addSubcommand((command) =>
                    command
                        .setName("toggles")
                        .setDescription("Toggle certain log")
                        .addStringOption((option) =>
                            option
                                .setName("toggle")
                                .setDescription("Log Setting")
                                .setRequired(false)
                                .setAutocomplete(true)
                        )
                )
                .addSubcommand((command) =>
                    command
                        .setName("status")
                        .setDescription("Check current status of your logs")
                )
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild())
            return interaction.reply({
                content: "This command can only be used in a server",
                ephemeral: true
            });

        const { database, util } = this.container;

        const { options, guild } = interaction;

        if (!guild?.members.me?.permissions.has("ManageMessages"))
            return interaction.reply({
                content: "I do not have the `ManageMessages` permission",
                ephemeral: true
            });

        const db = await database.guilds.fetch(guild.id);

        switch (options.getSubcommand()) {
            case "channel": {
                const channel = options.getChannel("text_channel", true);

                const permissions = guild.members.me?.permissionsIn(channel);
                if (!permissions?.has("ViewChannel"))
                    return interaction.reply({
                        content: "Missing permission `View Channel`",
                        ephemeral: true
                    });
                if (!permissions.has("SendMessages"))
                    return interaction.reply({
                        content: "Missing permission `Send Messages`",
                        ephemeral: true
                    });

                db.logs.channel = channel.id;

                await db.save();

                await interaction.reply({
                    content: `Logs channel set to ${channel}`,
                    ephemeral: true
                });
                break;
            }
            case "toggles": {
                const toggle = options.getString("toggle");

                if (toggle) {
                    const toggleName = capitalize(
                        toggle.split(/(?=[A-Z])/).join(" ")
                    );

                    db.logs.types[toggle as keyof typeof db.logs.types] =
                        !db.logs.types[toggle as keyof typeof db.logs.types];

                    await db.save();

                    const newValue = db.logs.types[
                        toggle as keyof typeof db.logs.types
                    ]
                        ? "Enabled"
                        : "Disabled";

                    await interaction.reply({
                        content: `\`${toggleName}\` - **${newValue}**`,
                        ephemeral: true
                    });
                    break;
                }

                const toggles = Object.keys(db.logs.types)
                    .map((toggle) => toggle.split(/(?=[A-Z])/).join(" "))
                    .map((toggle) => {
                        const currentStatus = db.logs.types[
                            toggle
                                .split(" ")
                                .join("") as keyof typeof db.logs.types
                        ]
                            ? "Enabled"
                            : "Disabled";

                        return {
                            label: `${capitalize(toggle)} - ${currentStatus}`,
                            value: toggle.split(" ").join("")
                        };
                    });

                const row = util
                    .row()
                    .setComponents(
                        util
                            .stringMenu()
                            .setCustomId("choose_toggles")
                            .setOptions(toggles)
                            .setPlaceholder("Event - Current Status")
                            .setMinValues(1)
                            .setMaxValues(toggles.length)
                    );

                const message = await interaction.reply({
                    content: "⬇ Choose Toggles From Below ⬇",
                    components: [row],
                    fetchReply: true
                });

                const sInteraction = await message.awaitMessageComponent({
                    componentType: ComponentType.StringSelect,
                    filter: (i) =>
                        i.customId === "choose_toggles" &&
                        i.user.id === interaction.user.id
                });

                const chosenToggles = sInteraction.values;
                const messages = [];
                await message.delete();
                await sInteraction.deferReply({ ephemeral: true });
                for (let i = 0; i < chosenToggles.length; i++) {
                    const chosenToggle = chosenToggles[i];

                    const toggleName = capitalize(
                        chosenToggle.split(/(?=[A-Z])/).join(" ")
                    );

                    db.logs.types[chosenToggle as keyof typeof db.logs.types] =
                        !db.logs.types[
                            chosenToggle as keyof typeof db.logs.types
                        ];

                    const newValue = db.logs.types[
                        chosenToggle as keyof typeof db.logs.types
                    ]
                        ? "Enabled"
                        : "Disabled";

                    messages.push(`\`${toggleName}\` - **${newValue}**`);
                }

                await db.save();

                const embed = util
                    .embed()
                    .setTitle("Toggled Logs")
                    .setDescription(messages.join("\n"));

                await sInteraction.editReply({ embeds: [embed] });
                break;
            }
            case "status": {
                const channel = guild.channels.cache.get(db.logs.channel);

                const toggles = Object.keys(db.logs.types).map((key) => {
                    const formatted = capitalize(
                        key.split(/(?=[A-Z])/).join(" ")
                    );
                    const value =
                        db.logs.types[key as keyof typeof db.logs.types];

                    return `\`${formatted}\`: ${value ? "On" : "Off"}`;
                });

                const embed = util.embed().setTitle(`${guild.name} Logs Status`)
                    .setDescription(`
                    \`Channel\`: ${channel ? channel : "Not Set"}

                    ${toggles.join("\n")}
                    `);

                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            }
        }
    }
}
