import { KUserOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import { ChatInputCommandInteraction } from "discord.js";

@SlashCommand({
    name: "rank",
    description: "Look at your or someone else's rank",
    options: [
        new KUserOption()
            .setName("user")
            .setDescription("The user to get the rank of")
            .setRequired(false)
    ]
})
export default class RankCommand extends AbstractSlashCommand {
    async run(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { options } = interaction;

        let member = options.getMember("person");
        if (!member) member = interaction.member;

        if (member.user.bot)
            return interaction.reply({
                content: `${member} is a bot`,
                ephemeral: true
            });

        await interaction.reply({
            content: `**Loading ${
                member.user.id === interaction.user.id ? "your" : `${member}'s`
            } rank card...**`,
            allowedMentions: { users: [] }
        });

        if (!member)
            return interaction.editReply({ content: "Failed to get member" });

        const attachment = await this.client.kanvas.member.rank(member);

        if (!attachment)
            return interaction.reply({
                content: "Failed to get rank card",
                ephemeral: true
            });

        return interaction.editReply({ content: null, files: [attachment] });
    }
}
