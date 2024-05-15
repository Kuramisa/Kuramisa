import { KAttachment, KUserOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import { memberActions } from "@utils";
import { ChatInputCommandInteraction } from "discord.js";

@SlashCommand({
    name: "whois",
    description: "Get information about a user",
    options: [
        new KUserOption()
            .setName("user")
            .setDescription("The user to get information about")
            .setRequired(false)
    ]
})
export default class PingCommand extends AbstractSlashCommand {
    async run(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild())
            return interaction.reply({
                content: "This command can only be used in a server",
                ephemeral: true
            });

        let member = interaction.options.getMember("member");

        if (!member) member = interaction.member;

        const { user } = member;

        if (user.bot)
            return interaction.reply({
                content: `${member} is a bot`,
                ephemeral: true
            });

        await interaction.deferReply();

        const { kanvas } = this.client;

        const rows = memberActions(interaction.member, member);

        const profile = await kanvas.member.profile(member);

        const attachment = new KAttachment(profile, {
            name: `profile-${user.id}.png`
        });

        return interaction.editReply({
            components: rows,
            files: [attachment]
        });
    }
}
