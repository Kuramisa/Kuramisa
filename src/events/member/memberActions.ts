import { KAttachment, KModal, KModalRow, KTextInput, KEmbed } from "@builders";
import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { Pagination, daysToSeconds } from "@utils";
import { GuildMember, Interaction, PermissionResolvable } from "discord.js";
import { startCase } from "lodash";

@KEvent({
    event: "interactionCreate",
    description: "Button interactions for member actions"
})
export default class MemberActionsButtons extends AbstractKEvent {
    async run(interaction: Interaction) {
        if (!interaction.isButton()) return;
        if (
            ![
                "show_rank",
                "show_warns",
                "kick_member",
                "ban_member",
                "warn_member"
            ].includes(interaction.customId)
        )
            return;

        if (!interaction.guild) return;

        const { kanvas, moderation } = this.client;

        const { guild, message } = interaction;
        let member = interaction.member;
        if (!member) return;
        if (!(member instanceof GuildMember))
            member = await guild.members
                .fetch(interaction.user.id)
                .catch(() => null);
        if (!member) return;

        const attachment = message.attachments.at(0);
        if (!attachment) return;

        const targetId = attachment.name.split("-")[1].replace(".png", "");

        if (!targetId)
            return interaction.reply({
                content:
                    "**Old system detected, re-use the command to use this button**",
                ephemeral: true
            });

        const target = await guild.members.fetch(targetId).catch(() => null);

        if (!target)
            return interaction.reply({
                content: "**Member not found**",
                ephemeral: true
            });

        const notEnoughPerms = (perms: PermissionResolvable[]) =>
            `**Missing permissions: ${perms.map((perm) => startCase(perm.toString())).join(", ")}**`;

        switch (interaction.customId) {
            case "show_rank": {
                await interaction.deferReply({ ephemeral: true });

                const rank = await kanvas.member.rank(target);
                if (!rank)
                    return interaction.reply({
                        content: "Could not retrieve rank card",
                        ephemeral: true
                    });

                const attachment = new KAttachment(rank, {
                    name: `rank-${member.id}.png`
                });

                await interaction.editReply({
                    files: [attachment]
                });
                break;
            }
            case "kick_member": {
                if (
                    !member.permissions.has("KickMembers") ||
                    !guild.members.me?.permissions.has("KickMembers")
                )
                    return interaction.reply({
                        content: notEnoughPerms(["KickMembers"]),
                        ephemeral: true
                    });

                if (!target.kickable)
                    return interaction.reply({
                        content: `${target} is not kickable`,
                        ephemeral: true
                    });

                const modal = new KModal()
                    .setCustomId("kick-member-modal")
                    .setTitle(`Kicking ${target.user.username}`)
                    .setComponents(
                        new KModalRow().setComponents(
                            new KTextInput()
                                .setCustomId("kick-reason")
                                .setLabel("Reason")
                        )
                    );

                await interaction.showModal(modal);

                const mInteraction = await interaction.awaitModalSubmit({
                    time: 0
                });

                const reason =
                    mInteraction.fields.getTextInputValue("kick-reason");

                await target.kick(
                    `Kicked by ${member.user.username}, Reason: ${reason}`
                );

                return mInteraction.reply({
                    content: `You kicked ${target.user.username} from the server`,
                    ephemeral: true
                });
            }
            case "ban_member": {
                if (
                    !member.permissions.has("BanMembers") ||
                    !guild.members.me?.permissions.has("BanMembers")
                )
                    return interaction.reply({
                        content: notEnoughPerms(["BanMembers"]),
                        ephemeral: true
                    });

                if (!target.bannable)
                    return interaction.reply({
                        content: `${target} is not bannable`,
                        ephemeral: true
                    });

                const modal = new KModal()
                    .setCustomId("ban-member-modal")
                    .setTitle(`Banning ${target.user.username}`)
                    .setComponents(
                        new KModalRow().setComponents(
                            new KTextInput()
                                .setCustomId("ban-reason")
                                .setLabel("Reason")
                        ),
                        new KModalRow().setComponents(
                            new KTextInput()
                                .setCustomId("messages-days")
                                .setLabel("Days of messages to delete")
                                .setRequired(false)
                                .setMinLength(1)
                                .setMaxLength(1)
                                .setPlaceholder("Please enter a number")
                        )
                    );

                await interaction.showModal(modal);

                const mInteraction = await interaction.awaitModalSubmit({
                    time: 0
                });

                const reason =
                    mInteraction.fields.getTextInputValue("ban-reason");

                let days = parseInt(
                    mInteraction.fields.getTextInputValue("messages-days")
                );

                if (!days)
                    return mInteraction.reply({
                        content: "Please provide a number of days (0-7)",
                        ephemeral: true
                    });

                days = daysToSeconds(days);

                if (days < 0)
                    return mInteraction.reply({
                        content: "Provided days are less than 0",
                        ephemeral: true
                    });
                if (days > 7)
                    return mInteraction.reply({
                        content: "Provided days are more than 7",
                        ephemeral: true
                    });

                await target.ban({
                    reason: `Banned by ${target.user.username}, Reason: ${reason}`,
                    deleteMessageSeconds: days
                });

                return mInteraction.reply({
                    content: `You banned ${target.user.username} from the server`,
                    ephemeral: true
                });
            }
            case "warn_member": {
                if (!member.permissions.has("ModerateMembers"))
                    return interaction.reply({
                        content: notEnoughPerms(["ModerateMembers"]),
                        ephemeral: true
                    });
                const modal = moderation.warns.modal(target);

                await interaction.showModal(modal);

                const mInteraction = await interaction.awaitModalSubmit({
                    time: 0
                });

                const reason =
                    mInteraction.fields.getTextInputValue("warn_reason");

                await moderation.warns.create(guild, target, member, reason);

                return mInteraction.reply({
                    content: `You warned ${target}`,
                    ephemeral: true
                });
            }
            case "show_warns": {
                if (!member.permissions.has("ViewAuditLog"))
                    return interaction.reply({
                        content: notEnoughPerms(["ViewAuditLog"]),
                        ephemeral: true
                    });
                const warns = await moderation.warns.get(target);
                if (!warns || warns.length < 1)
                    return interaction.reply({
                        content: `${target} has no warns`,
                        ephemeral: true
                    });

                const embeds = [];

                for (const warn of warns) {
                    const embed = new KEmbed()
                        .setAuthor({
                            name: `${guild.name} Warns`,
                            iconURL: guild.iconURL() ?? undefined
                        })
                        .setTitle(`${target.user.username} Warn`)
                        .setDescription(warn.reason)
                        .setFooter({
                            text: `Warned by ${
                                guild.members.cache.get(warn.by)?.user.username
                            }`
                        })
                        .setTimestamp(warn.createdTimestamp);

                    embeds.push(embed);
                }

                return Pagination.embeds(interaction, embeds, true);
            }
        }
    }
}
