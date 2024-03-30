import { Command } from "@sapphire/framework";
import { ButtonStyle, ChannelType, ComponentType } from "discord.js";

export class DVCCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "dvc",
            description: "Dynamic Voice Channels",
            requiredClientPermissions: "ManageChannels",
            requiredUserPermissions: "ManageChannels"
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
                        .setName("convert")
                        .setDescription(
                            "Convert a voice channel to a dynamic one"
                        )
                )
                .addSubcommand((command) =>
                    command
                        .setName("undo")
                        .setDescription(
                            "Undo a dynamic channel to a normal one"
                        )
                        .addStringOption((option) =>
                            option
                                .setName("channel_to_undo")
                                .setDescription("Channel to undo")
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
                )
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const { database, util } = this.container;

        const { guild, options } = interaction;
        if (!guild) return;

        const db = await database.guilds.fetch(guild.id);

        switch (options.getSubcommand()) {
            case "convert": {
                const message = await interaction.deferReply({
                    ephemeral: true
                });

                const voiceChannels = util.chunk(
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
                            db.dvc.some((vc) => vc.parentId === channel.id) ||
                            db.dvc.some((vc) => vc.id === channel.id) ||
                            channel.parentId === null
                        )
                            continue;

                        options.push({
                            label: channel.name,
                            value: channel.id
                        });
                    }

                    rows.push(
                        util.row().setComponents(
                            util
                                .stringMenu()
                                .setCustomId(`convert-channels-${i}`)
                                .setOptions(...options)
                                .setMinValues(1)
                                .setMaxValues(options.length)
                        )
                    );
                }

                const row = util
                    .row()
                    .setComponents(
                        util
                            .button()
                            .setCustomId("convert-go-back")
                            .setLabel("Go back")
                            .setStyle(ButtonStyle.Danger),
                        util
                            .button()
                            .setCustomId("convert-load-more")
                            .setLabel("Load More")
                            .setStyle(ButtonStyle.Success)
                    );

                await interaction.editReply({
                    components:
                        rows.length > 1 ? [rows[page], row] : [rows[page]]
                });

                const collector = message.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    filter: (i) =>
                        (i.customId === "convert-go-back" ||
                            i.customId === "convert-load-more") &&
                        i.user.id === interaction.user.id
                });

                collector.on("collect", async (i) => {
                    switch (i.customId) {
                        case "convert-go-back": {
                            page = page > 0 ? --page : rows.length - 1;
                            break;
                        }
                        case "convert-load-more": {
                            page = page + 1 < rows.length ? ++page : 0;
                            break;
                        }
                        default:
                            break;
                    }

                    await i.deferUpdate();
                    await i.update({
                        components:
                            rows.length > 1 ? [rows[page], row] : [rows[page]]
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
                    db.dvc.push({
                        parentId: value,
                        id: value,
                        categoryId: channel.parentId
                    });
                }

                const embed = util
                    .embed()
                    .setTitle("Voice Channel Conversion")
                    .setDescription(
                        `Voice channels converted to Dynamic voice channels\n\n${sInteraction.values
                            .map((value) => `<#${value}>`)
                            .join("\n")}`
                    );

                await db.save();

                await message.edit({ embeds: [embed], components: [] });
                break;
            }
            case "undo": {
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

                return interaction.reply({
                    content: `Removed <#${channelId}> from being a dynamic voice channel`,
                    ephemeral: true
                });
            }
        }
    }
}
