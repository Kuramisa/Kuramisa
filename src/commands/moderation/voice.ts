import { KEmbed, KRow, KChannelOption, KStringDropdown } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import {
    ChannelType,
    ChatInputCommandInteraction,
    ComponentType
} from "discord.js";

@SlashCommand({
    name: "voice",
    description: "Voice utility commands",
    guildOnly: true,
    subcommands: [
        {
            name: "move",
            description: "Move a user to a voice channel",
            options: [
                new KChannelOption()
                    .setName("channel")
                    .setDescription("The channel to move the member(s) to")
                    .addChannelTypes(ChannelType.GuildVoice)
                    .setRequired(true)
            ]
        },
        {
            name: "moveall",
            description: "Move all users in a voice channel to another",
            options: [
                new KChannelOption()
                    .setName("channel")
                    .setDescription("The channel to move the members to")
                    .addChannelTypes(ChannelType.GuildVoice)
                    .setRequired(true)
            ]
        }
    ]
})
export default class PingCommand extends AbstractSlashCommand {
    async slashMove(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const { guild, options } = interaction;

        const { channel: currentVc } = interaction.member.voice;
        if (!currentVc)
            return interaction.reply({
                content: "You are not in a voice channel",
                ephemeral: true
            });

        const channel = options.getChannel("channel", true, [
            ChannelType.GuildVoice
        ]);

        if (channel.equals(currentVc))
            return interaction.reply({
                content: "You cannot move members to the same channel",
                ephemeral: true
            });

        const { members } = currentVc;

        const opts = members.first(25).map((member) => ({
            label: member.user.username,
            value: member.id
        }));

        const row = new KRow().setComponents(
            new KStringDropdown()
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

        const embed = new KEmbed().setDescription(
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
    }

    async slashMoveall(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const { member, options } = interaction;

        const { channel: currentVc } = interaction.member.voice;
        if (!currentVc)
            return interaction.reply({
                content: "You are not in a voice channel",
                ephemeral: true
            });

        const channel = options.getChannel("channel", true, [
            ChannelType.GuildVoice
        ]);

        if (channel.equals(currentVc))
            return interaction.reply({
                content: "You cannot move members to the same channel",
                ephemeral: true
            });

        const { members } = currentVc;

        members.forEach((m) =>
            m.voice.setChannel(channel, `Moved by ${member}`)
        );

        return interaction.reply({
            content: `Moved everyone to ${channel}`,
            ephemeral: true
        });
    }
}
