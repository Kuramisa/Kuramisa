import { KEmbed, KRow, KUserOption, KStringDropdown } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import { Pagination } from "@utils";
import { ChatInputCommandInteraction, ComponentType } from "discord.js";

@SlashCommand({
    name: "warns",
    description: "Manage Member's warns",
    subcommands: [
        {
            name: "view",
            description: "View a member's warns",
            options: [
                new KUserOption()
                    .setName("member")
                    .setDescription("The member to check the warns for")
            ]
        },
        {
            name: "remove",
            description: "Remove a member's warns",
            options: [
                new KUserOption()
                    .setName("member")
                    .setDescription("The member to remove the warns for")
            ]
        },
        {
            name: "clear",
            description: "Clear a member's warns",
            options: [
                new KUserOption()
                    .setName("member")
                    .setDescription("The member to clear the warns for")
            ]
        }
    ]
})
export default class SCommand extends AbstractSlashCommand {
    async slashView(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { moderation } = this.client;
        const { options } = interaction;

        const member = options.getMember("member");
        if (!member)
            return interaction.reply({
                content: "**Member not found**",
                ephemeral: true
            });

        if (member.user.bot)
            return interaction.reply({
                content: "**You cannot view a bot's warns**",
                ephemeral: true
            });

        const warns = await moderation.warns.get(member);
        if (warns.length < 1)
            return interaction.reply({
                content: `${member} has no warns`,
                ephemeral: true
            });

        const embeds = [];
        for (const warn of warns) {
            embeds.push(
                new KEmbed()
                    .setAuthor({
                        name: `${member.user.globalName ?? member.user.username} - Warns`,
                        iconURL: member.avatarURL() ?? ""
                    })
                    .setDescription(`**Warned by**: <@${warn.by}>`)
                    .addFields({
                        name: "Reason",
                        value: warn.reason
                    })
                    .setTimestamp(warn.createdTimestamp)
                    .setFooter({ text: `Warn ID: ${warn.id}` })
            );
        }

        Pagination.embeds(interaction, embeds, true);
    }

    async slashRemove(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { moderation } = this.client;
        const { guild, options } = interaction;

        const member = options.getMember("member");
        if (!member)
            return interaction.reply({
                content: "**Member not found**",
                ephemeral: true
            });

        if (member.user.bot)
            return interaction.reply({
                content: "**You cannot view a bot's warns**",
                ephemeral: true
            });

        const warns = await moderation.warns.get(member);
        if (warns.length < 1)
            return interaction.reply({
                content: `${member} has no warns`,
                ephemeral: true
            });

        const opts = [];

        for (const warn of warns) {
            let by = guild.members.cache.get(warn.by) ?? null;
            if (!by) by = await guild.members.fetch(warn.by).catch(() => null);
            if (!by) continue;
            opts.push({
                label: `Reason: ${warn.reason} | Warned by: ${by.user.globalName ?? by.user.username}`,
                value: warn.id
            });
        }

        const row = new KRow().setComponents(
            new KStringDropdown()
                .setCustomId("warn_remove_select")
                .setMinValues(1)
                .setMaxValues(warns.length)
                .setOptions(opts)
        );

        const msg = await interaction.reply({
            content: `Select the warns you want to remove for ${member}`,
            components: [row],
            ephemeral: true
        });

        const sInteraction = await msg.awaitMessageComponent({
            componentType: ComponentType.StringSelect,
            filter: (i) =>
                i.customId === "warn_remove_select" &&
                i.user.id === interaction.user.id
        });

        const { values } = sInteraction;

        const warnsRemoved = [];

        for (const value of values) {
            const warn = warns.find((w) => w.id === value);
            if (!warn) continue;
            warnsRemoved.push(warn);
            await moderation.warns.remove(value, member);
        }

        await sInteraction.update({
            content: `Removed ${warnsRemoved.length} warns for ${member}\n\n**Warns Removed**\n${warnsRemoved.map((w) => `Reason: ${w.reason} - Warned by: <@${w.by}`).join("\n")}`,
            components: []
        });
    }

    async slashClear(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { moderation } = this.client;
        const { options } = interaction;

        const member = options.getMember("member");
        if (!member)
            return interaction.reply({
                content: "**Member not found**",
                ephemeral: true
            });

        if (member.user.bot)
            return interaction.reply({
                content: "**You cannot view a bot's warns**",
                ephemeral: true
            });

        const warns = await moderation.warns.get(member);
        if (warns.length < 1)
            return interaction.reply({
                content: `${member} has no warns`,
                ephemeral: true
            });

        await moderation.warns.clear(member);

        await interaction.reply({
            content: `Cleared ${member}'s warns`,
            ephemeral: true
        });
    }
}
