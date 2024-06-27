import {
    KButton,
    KEmbed,
    KRow,
    KStringOption,
    KStringDropdown
} from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import {
    ButtonStyle,
    ChannelType,
    ChatInputCommandInteraction,
    ComponentType
} from "discord.js";
import { chunk } from "lodash";

@SlashCommand({
    name: "dvc",
    description: "Dynamic Voice Channels",
    subcommands: [
        {
            name: "convert",
            description: "Convert a voice channel to a DVC"
        },
        {
            name: "undo",
            description: "Undo a DVC conversion",
            options: [
                new KStringOption()
                    .setName("channel_to_undo")
                    .setDescription("Channel to undo")

                    .setAutocomplete(true)
            ]
        }
    ]
})
export default class DVCCommand extends AbstractSlashCommand {
    async slashConvert(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) return;

        const { database, managers } = this.client;
        const guild = await managers.guilds.get(interaction.guild.id);
        const db = await database.guilds.fetch(interaction.guild.id);

        await interaction.deferReply({
            ephemeral: true
        });

        const voiceChannels = chunk(
            guild.channels.cache
                .filter((ch) => ch.type === ChannelType.GuildVoice)
                .toJSON(),
            25
        );

        let page = 0;

        const rows: any[] = [];
        for (let i = 0; i < voiceChannels.length; i++) {
            const channels = voiceChannels[i];
            const options = [];
            for (let j = 0; j < channels.length; j++) {
                const channel = channels[j];
                if (
                    guild.dvc.some((vc) => vc.parentId === channel.id) ||
                    guild.dvc.some((vc) => vc.id === channel.id) ||
                    channel.parentId === null
                )
                    continue;

                options.push({
                    label: channel.name,
                    value: channel.id
                });
            }

            rows.push(
                new KRow().setComponents(
                    new KStringDropdown()
                        .setCustomId(`convert-channels-${i}`)
                        .setOptions(...options)
                        .setMinValues(1)
                        .setMaxValues(options.length)
                )
            );
        }

        const row = new KRow().setComponents(
            new KButton()
                .setCustomId("convert-go-back")
                .setLabel("Go back")
                .setStyle(ButtonStyle.Danger),
            new KButton()
                .setCustomId("convert-load-more")
                .setLabel("Load More")
                .setStyle(ButtonStyle.Success)
        );

        const message = await interaction.editReply({
            components: rows.length > 1 ? [rows[page], row] : [rows[page]]
        });

        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: (i) =>
                (i.customId === "convert-go-back" ||
                    i.customId === "convert-load-more") &&
                i.user.id === interaction.user.id
        });

        collector.on("collect", async (i) => {
            if (i.customId === "convert-go-back")
                page = page > 0 ? --page : rows.length - 1;
            if (i.customId === "convert-load-more")
                page = page + 1 < rows.length ? ++page : 0;

            await i.deferUpdate();
            await i.update({
                components: rows.length > 1 ? [rows[page], row] : [rows[page]]
            });
        });

        const sInteraction = await message.awaitMessageComponent({
            componentType: ComponentType.StringSelect,
            filter: (i) =>
                i.customId.includes("convert-channels") &&
                i.user.id === interaction.user.id
        });

        await sInteraction.deferUpdate();
        for (let i = 0; i < sInteraction.values.length; i++) {
            const value = sInteraction.values[i];
            const channel = guild.channels.cache.get(value);
            if (!channel || !channel.parentId) continue;
            guild.dvc.push({
                parentId: value,
                id: value,
                categoryId: channel.parentId
            });
        }

        const embed = new KEmbed()
            .setTitle("Voice Channel Conversion")
            .setDescription(
                `Voice channels converted to Dynamic voice channels\n\n${sInteraction.values
                    .map((value) => `<#${value}>`)
                    .join("\n")}`
            );

        await db.save();

        await message.edit({ embeds: [embed], components: [] });
    }

    async slashUndo(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) return;

        const { options } = interaction;
        const { database } = this.client;
        const db = await database.guilds.fetch(interaction.guild.id);

        const channelId = options.getString("channel_to_undo", true);

        const dvc = db.dvc.find((vc) => vc.parentId === channelId);
        if (!dvc)
            return interaction.reply({
                content: "Dynamic Voice Channel not found",
                ephemeral: true
            });

        db.dvc = db.dvc.filter((vc) => vc.parentId !== channelId);

        db.markModified("dvc");
        await db.save();

        interaction.reply({
            content: `Removed <#${channelId}> from being a dynamic voice channel`,
            ephemeral: true
        });
    }
}
