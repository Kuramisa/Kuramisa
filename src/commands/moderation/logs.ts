import {
    Embed,
    Row,
    ChannelOption,
    StringOption,
    StringDropdown,
} from "@builders";
import { AbstractSlashCommand, SlashCommand } from "classes/SlashCommand";
import {
    ChannelType,
    ChatInputCommandInteraction,
    ComponentType,
    InteractionContextType,
} from "discord.js";
import { camelCase, startCase } from "lodash";

@SlashCommand({
    name: "logs",
    description: "Configure the logging system for the server",
    contexts: [InteractionContextType.Guild],
    subcommands: [
        {
            name: "channel",
            description: "Set the logging channel",
            options: [
                new ChannelOption()
                    .setName("text_channel")
                    .setDescription("The channel to set as the logging channel")

                    .addChannelTypes(ChannelType.GuildText),
            ],
        },
        {
            name: "toggles",
            description: "Toggle logging events",
            options: [
                new StringOption()
                    .setName("toggle")
                    .setDescription("The event to toggle")
                    .setRequired(false)
                    .setAutocomplete(true),
            ],
        },
        {
            name: "status",
            description: "Check current status of your logs",
        },
    ],
})
export default class LogsCommand extends AbstractSlashCommand {
    async slashChannel(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { database } = this.client;
        const { guildId, options } = interaction;

        const db = await database.guilds.fetch(guildId);

        const channel = options.getChannel("text_channel", true);

        db.logs.channel = channel.id;
        await db.save();

        interaction.reply({
            content: `Logging channel has been set to ${channel}`,
            ephemeral: true,
        });
    }

    async slashToggles(interaction: ChatInputCommandInteraction) {
        if (!interaction.guildId) return;

        const { database } = this.client;
        const { guildId, options } = interaction;

        const db = await database.guilds.fetch(guildId);
        const toggle = options.getString("toggle");

        if (toggle) {
            const toggleName = startCase(toggle);

            db.logs.types[toggle as keyof typeof db.logs.types] =
                !db.logs.types[toggle as keyof typeof db.logs.types];

            await db.save();

            const newValue = db.logs.types[toggle as keyof typeof db.logs.types]
                ? "Enabled"
                : "Disabled";

            return interaction.reply({
                content: `\`${toggleName}\` - **${newValue}**`,
                ephemeral: true,
            });
        }

        const toggles = Object.keys(db.logs.types)
            .map(startCase)
            .map((toggle) => {
                const currentStatus = db.logs.types[
                    camelCase(toggle) as keyof typeof db.logs.types
                ]
                    ? "Enabled"
                    : "Disabled";

                return {
                    label: `${toggle} - ${currentStatus}`,
                    value: camelCase(toggle),
                };
            });

        const row = new Row().setComponents(
            new StringDropdown()
                .setCustomId("choose_toggles")
                .setOptions(toggles)
                .setPlaceholder("Event - Current Status")
                .setMinValues(1)
                .setMaxValues(toggles.length)
        );

        const message = await interaction.reply({
            content: "⬇ Choose Toggles From Below ⬇",
            components: [row],
            ephemeral: true,
        });

        const sInteraction = await message.awaitMessageComponent({
            componentType: ComponentType.StringSelect,
            filter: (i) =>
                i.customId === "choose_toggles" &&
                i.user.id === interaction.user.id,
        });

        const chosenToggles = sInteraction.values;
        const messages = [];
        await sInteraction.deferUpdate();
        for (const chosenToggle of chosenToggles) {
            const toggleName = startCase(chosenToggle);

            db.logs.types[chosenToggle as keyof typeof db.logs.types] =
                !db.logs.types[chosenToggle as keyof typeof db.logs.types];

            const newValue = db.logs.types[
                chosenToggle as keyof typeof db.logs.types
            ]
                ? "Enabled"
                : "Disabled";

            messages.push(`\`${toggleName}\` - **${newValue}**`);
        }

        await db.save();

        const embed = new Embed()
            .setTitle("Toggled Logs")
            .setDescription(messages.join("\n"));

        await sInteraction.editReply({
            embeds: [embed],
            content: "",
            components: [],
        });
    }

    async slashStatus(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) return;

        const { database } = this.client;
        const { guild } = interaction;

        const db = await database.guilds.fetch(guild.id);
        if (!db.logs.channel)
            return interaction.reply({
                content: "Logs channel is not set!",
                ephemeral: true,
            });

        const channel = guild.channels.cache.get(db.logs.channel);

        const toggles = Object.keys(db.logs.types).map((key) => {
            const formatted = startCase(key);
            const value = db.logs.types[key as keyof typeof db.logs.types];

            return `\`${formatted}\`: ${value ? "On" : "Off"}`;
        });

        const embed = new Embed()
            .setTitle(`${guild.name} Logs Status`)
            .setDescription(
                `\`Channel\`: ${channel ?? "Not set"}\n\n${toggles.join("\n")}`
            );

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}
