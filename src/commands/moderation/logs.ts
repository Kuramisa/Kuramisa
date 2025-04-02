import {
    ChannelOption,
    Embed,
    Row,
    StringDropdown,
    StringOption,
} from "Builders";
import { AbstractSlashCommand, SlashCommand } from "classes/SlashCommand";
import type { ChatInputCommandInteraction } from "discord.js";
import { ChannelType, ComponentType } from "discord.js";
import camelCase from "lodash/camelCase";
import startCase from "lodash/startCase";

@SlashCommand({
    name: "logs",
    description: "Configure the logging system for the server",
    requiredUserPermissions: ["ViewAuditLog"],
    requiredClientPermissions: [
        "ReadMessageHistory",
        "SendMessages",
        "ViewAuditLog",
    ],
    subcommands: [
        {
            name: "channel",
            description: "Set the logging channel",
            opts: [
                new ChannelOption()
                    .setName("text_channel")
                    .setDescription("The channel to set as the logging channel")
                    .addChannelTypes(ChannelType.GuildText),
            ],
        },
        {
            name: "toggles",
            description: "Toggle logging events",
            opts: [
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

        const { client, guildId, options } = interaction;

        const db = await client.managers.guilds.get(guildId);

        const channel = options.getChannel("text_channel", true);

        db.logs.channel = channel.id;
        await db.save();

        await interaction.reply({
            content: `Logging channel has been set to ${channel}`,
            flags: "Ephemeral",
        });
    }

    async slashToggles(interaction: ChatInputCommandInteraction) {
        if (!interaction.guildId) return;

        const { client, guildId, options } = interaction;

        const db = await client.managers.guilds.get(guildId);
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
                flags: "Ephemeral",
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
                .setMaxValues(toggles.length),
        );

        const message = await interaction.reply({
            content: "⬇ Choose Toggles From Below ⬇",
            components: [row],
            flags: "Ephemeral",
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

        const { client, guild } = interaction;

        const db = await client.managers.guilds.get(guild.id);
        if (!db.logs.channel)
            return interaction.reply({
                content: "Logs channel is not set!",
                flags: "Ephemeral",
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
                `\`Channel\`: ${channel ?? "Not set"}\n\n${toggles.join("\n")}`,
            );

        await interaction.reply({ embeds: [embed], flags: "Ephemeral" });
    }
}
