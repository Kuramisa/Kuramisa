import { KStringOption, KUserOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import { ChatInputCommandInteraction } from "discord.js";

@SlashCommand({
    name: "warn",
    description: "Warn a member",
    options: [
        new KUserOption()
            .setName("member")
            .setDescription("The member to warn"),
        new KStringOption()
            .setName("reason")
            .setDescription("The reason for the warning")
    ]
})
export default class WarnCommand extends AbstractSlashCommand {
    async run(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const {
            moderation: { warns }
        } = this.client;

        const { guild, options } = interaction;

        const member = options.getMember("member");
        if (!member)
            return interaction.reply({
                content: "**Member not found**",
                ephemeral: true
            });
        if (member.user.bot)
            return interaction.reply({
                content: "**You cannot warn a bot**",
                ephemeral: true
            });

        const reason = options.getString("reason") ?? "No reason provided";

        await warns.create(guild, member, interaction.member, reason);

        await interaction.reply({
            content: `You warned ${member.user.globalName ?? member.user.username}`,
            ephemeral: true
        });
    }
}
