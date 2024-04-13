import { Command } from "@sapphire/framework";
import { ChannelType, ComponentType } from "discord.js";

export class VoiceCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "voice",
            description: "Voice utilities for members",
            requiredUserPermissions: "MoveMembers"
        });
    }

    override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .setDMPermission(false)
                .setDefaultMemberPermissions(1 << 24)
                .addSubcommand((command) =>
                    command
                        .setName("move")
                        .setDescription(
                            "Move selected members from one vc to another"
                        )
                        .addChannelOption((option) =>
                            option
                                .setName("channel")
                                .setDescription("Channel to move them into")
                                .addChannelTypes(ChannelType.GuildVoice)
                                .setRequired(true)
                        )
                )
                .addSubcommand((command) =>
                    command
                        .setName("moveall")
                        .setDescription("Move a person from one vc to another")
                        .addChannelOption((option) =>
                            option
                                .setName("channel")
                                .setDescription("Channel to move them into")
                                .addChannelTypes(ChannelType.GuildVoice)
                                .setRequired(true)
                        )
                )
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild())
            return interaction.reply({
                content: "This command can only be used in a server",
                ephemeral: true
            });

        const { util } = this.container;

        const { options, guild, member } = interaction;

        if (!guild.members.me?.permissions.has("MoveMembers"))
            return interaction.reply({
                content: "I do not have the `MoveMembers` permission",
                ephemeral: true
            });

        const currentVC = member.voice.channel;

        if (!currentVC)
            return interaction.reply({
                content: "You have to be in a voice channel",
                ephemeral: true
            });

        switch (options.getSubcommand()) {
            case "move": {
                const channel = options.getChannel("channel", true);
                if (!channel.isVoiceBased()) return;

                if (channel.equals(currentVC))
                    return interaction.reply({
                        content: "You cannot move members to the same channel",
                        ephemeral: true
                    });

                const members = currentVC.members;

                const opts = members.first(25).map((member) => ({
                    label: member.user.username,
                    value: member.id
                }));

                const row = util
                    .row()
                    .setComponents(
                        util
                            .stringMenu()
                            .setCustomId("voice_member_select")
                            .setPlaceholder("Who do you want to move?")
                            .setOptions(opts)
                            .setMaxValues(opts.length)
                    );

                await interaction.deferReply({ ephemeral: true });

                const message = await interaction.editReply({
                    components: [row]
                });

                const awaitMembers = await message.awaitMessageComponent({
                    componentType: ComponentType.StringSelect,
                    filter: (i) => i.customId === "voice_member_select"
                });

                const chosenMembers = awaitMembers.values.map((id) =>
                    guild.members.cache.get(id)
                );

                await awaitMembers.deferUpdate();

                chosenMembers.forEach((member) => {
                    if (!member) return;
                    member.voice.setChannel(channel, `Moved by ${member}`);
                });

                const embed = util
                    .embed()
                    .setDescription(
                        `Moved ${
                            chosenMembers.length
                        } Members to ${channel}\n\n**Members Moved**\n${chosenMembers
                            .map((member) => `${member}`)
                            .join(", ")}`
                    );

                await interaction.editReply({
                    embeds: [embed],
                    components: []
                });
                break;
            }
            case "moveall": {
                const channel = options.getChannel("channel", true);
                if (!channel.isVoiceBased()) return;

                if (channel.equals(currentVC))
                    return interaction.reply({
                        content: "You cannot move members to the same channel",
                        ephemeral: true
                    });

                const members = currentVC.members;

                members.forEach((m) =>
                    m.voice.setChannel(channel, `Moved by ${member}`)
                );

                return interaction.reply({
                    content: `Moved everyone to ${channel}`,
                    ephemeral: true
                });
            }
        }
    }
}
