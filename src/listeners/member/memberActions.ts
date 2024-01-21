import { Listener } from "@sapphire/framework";
import {
    AttachmentBuilder,
    ButtonInteraction,
    TextInputStyle,
} from "discord.js";

export class MemberActionsListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "Buttons for Member Embed",
            event: "interactionCreate",
        });
    }

    async run(interaction: ButtonInteraction) {
        if (!interaction.isButton()) return;

        if (
            ![
                "show_rank",
                "show_warns",
                "show_reports",
                "kick_member",
                "ban_member",
                "report_member",
                "warn_member",
            ].includes(interaction.customId)
        )
            return;

        if (!interaction.inCachedGuild())
            return interaction.reply({
                content: "This button can only be used in a server",
                ephemeral: true,
            });

        const { kanvas, moderation, util } = this.container;

        const { guild, message, member } = interaction;

        const attachment = message.attachments.at(0);
        if (!attachment) return;

        const targetId = attachment.name.split("-")[1].replace(".png", "");

        if (!targetId)
            return interaction.reply({
                content:
                    "**Old system detected, re-use the command to use this button**",
                ephemeral: true,
            });

        const target = await guild.members.fetch(targetId).catch(() => null);

        if (!target)
            return interaction.reply({
                content: "**Member not found**",
                ephemeral: true,
            });

        switch (interaction.customId) {
            case "show_rank": {
                await interaction.deferReply({ ephemeral: true });

                const rank = await kanvas.member.rank(target);
                if (!rank)
                    return interaction.reply({
                        content: "Could not retrieve rank card",
                        ephemeral: true,
                    });

                const attachment = new AttachmentBuilder(rank, {
                    name: `rank-${member.id}.png`,
                });

                return interaction.editReply({
                    files: [attachment],
                });
            }
            case "kick_member": {
                if (
                    !member.permissions.has("KickMembers") ||
                    !guild.members.me?.permissions.has("KickMembers")
                )
                    return interaction.reply({
                        content: "Not enough permissions",
                        ephemeral: true,
                    });

                if (!target.kickable)
                    return interaction.reply({
                        content: `${target} is not kickable`,
                        ephemeral: true,
                    });

                const modal = util
                    .modal()
                    .setCustomId("kick-member-modal")
                    .setTitle(`Kicking ${target.user.username}`)
                    .setComponents(
                        util
                            .modalRow()
                            .setComponents(
                                util
                                    .input()
                                    .setCustomId("kick-reason")
                                    .setLabel("Reason")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                            )
                    );

                await interaction.showModal(modal);

                const mInteraction = await interaction.awaitModalSubmit({
                    time: 0,
                });

                const reason =
                    mInteraction.fields.getTextInputValue("kick-reason");

                await target.kick(
                    `Kicked by ${member.user.username}, Reason: ${reason}`
                );

                return mInteraction.reply({
                    content: `You kicked ${target.user.username} from the server`,
                    ephemeral: true,
                });
            }
            case "ban_member": {
                if (
                    !member.permissions.has("BanMembers") ||
                    !guild.members.me?.permissions.has("BanMembers")
                )
                    return interaction.reply({
                        content: "Not enough permissions",
                        ephemeral: true,
                    });

                if (!target.bannable)
                    return interaction.reply({
                        content: `${target} is not bannable`,
                        ephemeral: true,
                    });

                const modal = util
                    .modal()
                    .setCustomId("ban-member-modal")
                    .setTitle(`Banning ${target.user.username}`)
                    .setComponents(
                        util
                            .modalRow()
                            .setComponents(
                                util
                                    .input()
                                    .setCustomId("ban-reason")
                                    .setLabel("Reason")
                                    .setRequired(true)
                                    .setStyle(TextInputStyle.Short)
                            ),
                        util
                            .modalRow()
                            .setComponents(
                                util
                                    .input()
                                    .setCustomId("messages-days")
                                    .setLabel("Days of messages to delete")
                                    .setStyle(TextInputStyle.Short)
                                    .setRequired(false)
                                    .setMinLength(1)
                                    .setMaxLength(1)
                                    .setPlaceholder("Please enter a number")
                            )
                    );

                await interaction.showModal(modal);

                const mInteraction = await interaction.awaitModalSubmit({
                    time: 0,
                });

                const reason =
                    mInteraction.fields.getTextInputValue("ban-reason");

                let days = parseInt(
                    mInteraction.fields.getTextInputValue("messages-days")
                );

                if (!days)
                    return mInteraction.reply({
                        content: "Please provide a number of days (0-7)",
                        ephemeral: true,
                    });

                days = util.daysToSeconds(days);

                if (days < 0)
                    return mInteraction.reply({
                        content: "Provided days are less than 0",
                        ephemeral: true,
                    });
                if (days > 7)
                    return mInteraction.reply({
                        content: "Provided days are more than 7",
                        ephemeral: true,
                    });

                await target.ban({
                    reason: `Banned by ${target.user.username}, Reason: ${reason}`,
                    deleteMessageSeconds: days,
                });

                return mInteraction.reply({
                    content: `You banned ${target.user.username} from the server`,
                    ephemeral: true,
                });
            }
            case "report_member": {
                const modal = moderation.reports.modal(target);

                await interaction.showModal(modal);

                const mIntereaction = await interaction.awaitModalSubmit({
                    time: 0,
                });

                const reason =
                    mIntereaction.fields.getTextInputValue("report-reason");

                await moderation.reports.create(target, member, reason);

                return interaction.reply({
                    content: `You reported ${target.user.username}`,
                    ephemeral: true,
                });
            }
            case "warn_member": {
                if (!member.permissions.has("ModerateMembers"))
                    return interaction.reply({
                        content: "Not enough permissions",
                        ephemeral: true,
                    });
                const modal = moderation.warns.modal(target);

                await interaction.showModal(modal);

                const mInteraction = await interaction.awaitModalSubmit({
                    time: 0,
                });

                const reason =
                    mInteraction.fields.getTextInputValue("warn-reason");

                await moderation.warns.create(target, member, reason);

                return interaction.reply({
                    content: `You warned ${target.user.username}`,
                    ephemeral: true,
                });
            }
            case "show_reports": {
                if (!member.permissions.has("ViewAuditLog"))
                    return interaction.reply({
                        content: "Not enough permissions",
                        ephemeral: true,
                    });
                const reports = await moderation.reports.get(target);
                if (!reports || reports.length < 1)
                    return interaction.reply({
                        content: `${target} has no reports`,
                        ephemeral: true,
                    });

                const embeds = [];

                for (const report of reports) {
                    const embed = util
                        .embed()
                        .setAuthor({
                            name: `${guild.name} Reports`,
                            iconURL: guild.iconURL() as string,
                        })
                        .setTitle(`${target.user.username} Report`)
                        .setDescription(report.reason)
                        .setFooter({
                            text: `Reported by ${
                                guild.members.cache.get(report.by)?.user
                                    .username
                            }`,
                        })
                        .setTimestamp(report.timestamp);

                    embeds.push(embed);
                }

                return util.pagination.embeds(interaction, embeds, true);
            }
            case "show_warns": {
                if (!member.permissions.has("ViewAuditLog"))
                    return interaction.reply({
                        content: "Not enough permissions",
                        ephemeral: true,
                    });
                const warns = await moderation.warns.get(target);
                if (!warns || warns.length < 1)
                    return interaction.reply({
                        content: `${target} has no warns`,
                        ephemeral: true,
                    });

                const embeds = [];

                for (const warn of warns) {
                    const embed = util
                        .embed()
                        .setAuthor({
                            name: `${guild.name} Warns`,
                            iconURL: guild.iconURL() as string,
                        })
                        .setTitle(`${target.user.username} Warn`)
                        .setDescription(warn.reason)
                        .setFooter({
                            text: `Warned by ${
                                guild.members.cache.get(warn.by)?.user.username
                            }`,
                        })
                        .setTimestamp(warn.timestamp);

                    embeds.push(embed);
                }

                return util.pagination.embeds(interaction, embeds, true);
            }
        }
    }
}
