import {
    KChannelOption,
    KEmbed,
    KNumberOption,
    KStringOption,
    KUserOption
} from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import {
    ChannelType,
    ChatInputCommandInteraction,
    messageLink
} from "discord.js";
import { capitalize } from "lodash";

@SlashCommand({
    name: "vote",
    description: "Create vote polls that cause action",
    subcommands: [
        {
            name: "create",
            description: "Create a vote poll",
            options: [
                new KUserOption()
                    .setName("member")
                    .setDescription("The member to vote on"),
                new KStringOption()
                    .setDescription("Reason for the vote poll")
                    .setName("reason"),
                new KStringOption()
                    .setName("type")
                    .setDescription("The type of vote poll")
                    .setChoices(
                        {
                            name: "Kick",
                            value: "kick"
                        },
                        {
                            name: "Ban",
                            value: "ban"
                        },
                        {
                            name: "Timeout",
                            value: "timeout"
                        }
                    ),
                new KNumberOption()
                    .setName("poll_duration")
                    .setDescription(
                        "The duration of the vote poll (in hours) (default: 24)"
                    )
                    .setRequired(false),
                new KNumberOption()
                    .setName("duration")
                    .setDescription(
                        "The duration that the person will be timeouted (only for timeout) (0 for permanent)"
                    )
                    .setRequired(false),
                new KChannelOption()
                    .setName("channel")
                    .setDescription(
                        "The channel to send the vote poll to (default: current channel)"
                    )
                    .addChannelTypes(ChannelType.GuildText)
                    .setRequired(false)
            ]
        },
        {
            name: "delete",
            description: "Delete a vote poll (without ending it)",
            options: [
                new KStringOption()
                    .setName("vote_poll")
                    .setDescription("The vote poll to delete")
                    .setAutocomplete(true)
            ]
        },

        {
            name: "end",
            description: "End a vote poll manually",
            options: [
                new KStringOption()
                    .setName("vote_poll")
                    .setDescription("The vote poll to end")
                    .setAutocomplete(true)
            ]
        }
    ]
})
export default class VoteCommand extends AbstractSlashCommand {
    async slashCreate(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const { guild, options } = interaction;

        const member = options.getMember("member");
        if (!member)
            return interaction.reply({
                content: "You must provide a member to vote on",
                ephemeral: true
            });

        if (member.id === interaction.user.id)
            return interaction.reply({
                content: "You cannot vote on yourself",
                ephemeral: true
            });

        if (member.user.bot)
            return interaction.reply({
                content: "You cannot vote on bots",
                ephemeral: true
            });

        const type = options.getString("type", true) as VoteType;

        switch (type) {
            case "kick":
                if (!member.kickable)
                    return interaction.reply({
                        content: `${member} is not kickable`,
                        ephemeral: true
                    });
                break;
            case "ban":
                if (!member.bannable)
                    return interaction.reply({
                        content: `${member} is not bannable`,
                        ephemeral: true
                    });
                break;
            case "timeout":
                if (!member.moderatable)
                    return interaction.reply({
                        content: `${member} is not timeoutable`,
                        ephemeral: true
                    });
                break;
            default:
                return interaction.reply({
                    content: "Invalid vote type",
                    ephemeral: true
                });
        }

        const { database } = this.client;

        const db = await database.guilds.fetch(interaction.guildId);

        if (!db.votePolls) db.votePolls = [];

        const existingPoll = db.votePolls.find(
            (poll) => poll.memberId === member.id
        );

        if (existingPoll)
            return interaction.reply({
                content: `There is already a vote poll for ${member.displayName} in ${messageLink(existingPoll.channelId, existingPoll.messageId, guild.id)}`,
                ephemeral: true
            });

        const duration = options.getNumber("duration") || 0;
        if (duration < 0)
            return interaction.reply({
                content: "Duration cannot be negative",
                ephemeral: true
            });

        const pollDuration = options.getNumber("poll_duration") || 24;
        const channel =
            options.getChannel("channel", false, [ChannelType.GuildText]) ||
            interaction.channel;

        const reason = options.getString("reason", true);

        if (!channel) return;

        const message = await channel.send({
            poll: {
                question: {
                    text: `Should we ${capitalize(type)} ${member.displayName}?`
                },
                duration: pollDuration,
                answers: [
                    {
                        text: "Yes",
                        emoji: "✅"
                    },
                    {
                        text: "No",
                        emoji: "❌"
                    }
                ],
                allowMultiselect: false
            }
        });

        if (!message.poll)
            return interaction.reply({
                content: "Failed to create vote poll",
                ephemeral: true
            });

        db.votePolls.push({
            memberId: member.id,
            channelId: channel.id,
            messageId: message.id,
            createdBy: interaction.user.id,
            voteType: type,
            duration,
            reason,
            pollDuration
        });

        await db.save();

        const embed = new KEmbed(interaction.member)
            .setDescription(`Vote poll created in ${channel}`)
            .setFields(
                {
                    name: "Reason",
                    value: reason
                },
                {
                    name: "Member",
                    value: member.toString(),
                    inline: true
                },
                {
                    name: "Type",
                    value: capitalize(type),
                    inline: true
                },
                {
                    name: "Poll Duration",
                    value: `${duration} hours`,
                    inline: true
                }
            );

        interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }

    async slashDelete(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { guild, options } = interaction;

        const pollId = options.getString("vote_poll", true);

        const { database } = this.client;

        const db = await database.guilds.fetch(interaction.guildId);

        const poll = db.votePolls.find((poll) => poll.messageId === pollId);

        if (!poll)
            return interaction.reply({
                content: "Vote poll not found",
                ephemeral: true
            });

        let member = guild.members.cache.get(poll.memberId);
        if (!member)
            member = (await guild.members.fetch(poll.memberId)) ?? undefined;
        if (!member)
            return interaction.reply({
                content: "Member not found",
                ephemeral: true
            });

        let channel = guild.channels.cache.get(poll.channelId);
        if (!channel)
            channel = (await guild.channels.fetch(poll.channelId)) ?? undefined;
        if (!channel)
            return interaction.reply({
                content: "Channel not found",
                ephemeral: true
            });
        if (!channel.isTextBased())
            return interaction.reply({
                content: "Channel is not text-based",
                ephemeral: true
            });

        const message = await channel.messages.fetch(poll.messageId);

        if (!message.poll)
            return interaction.reply({
                content: "Vote poll not found",
                ephemeral: true
            });

        await message.delete();

        db.votePolls = db.votePolls.filter((p) => p.messageId !== pollId);

        await db.save();

        interaction.reply({
            content: `Vote ${capitalize(poll.voteType)} Poll for ${member.toString()} was deleted in ${channel}`,
            ephemeral: true
        });
    }

    async slashEnd(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { guild, options } = interaction;

        const pollId = options.getString("vote_poll", true);

        const { database } = this.client;

        const db = await database.guilds.fetch(interaction.guildId);

        const poll = db.votePolls.find((poll) => poll.messageId === pollId);

        if (!poll)
            return interaction.reply({
                content: "Vote poll not found",
                ephemeral: true
            });

        let member = guild.members.cache.get(poll.memberId);
        if (!member)
            member = (await guild.members.fetch(poll.memberId)) ?? undefined;
        if (!member)
            return interaction.reply({
                content: "Member not found",
                ephemeral: true
            });

        let channel = guild.channels.cache.get(poll.channelId);
        if (!channel)
            channel = (await guild.channels.fetch(poll.channelId)) ?? undefined;
        if (!channel)
            return interaction.reply({
                content: "Channel not found",
                ephemeral: true
            });
        if (!channel.isTextBased())
            return interaction.reply({
                content: "Channel is not text-based",
                ephemeral: true
            });

        const message = await channel.messages.fetch(poll.messageId);

        if (!message.poll)
            return interaction.reply({
                content: "Vote poll not found",
                ephemeral: true
            });

        await message.poll.end();

        interaction.reply({
            content: `Vote ${capitalize(poll.voteType)} Poll for ${member.toString()} was manually ended in ${channel}`,
            ephemeral: true
        });
    }
}
