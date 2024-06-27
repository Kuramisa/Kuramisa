import { KAttachment } from "@builders";
import { AbstractMenuCommand, MenuCommand } from "@classes/MenuCommand";
import { memberActions } from "@utils";
import {
    ApplicationCommandType,
    ContextMenuCommandInteraction
} from "discord.js";

@MenuCommand({
    name: "User Info",
    description: "Get information about a user",
    guildOnly: true,
    type: ApplicationCommandType.User
})
export default class UserInfoCtxCommand extends AbstractMenuCommand {
    async run(interaction: ContextMenuCommandInteraction) {
        if (!interaction.inCachedGuild())
            return interaction.reply({
                content: "This command can only be used in a server",
                ephemeral: true
            });

        const { guild, targetId } = interaction;

        const member = await guild.members.fetch(targetId);
        if (!member)
            return interaction.reply({
                content: "Member not found",
                ephemeral: true
            });

        if (member.user.bot)
            return interaction.reply({
                content: `${member} is a bot`,
                ephemeral: true
            });

        await interaction.deferReply();

        const { kanvas } = this.client;

        const rows = memberActions(interaction.member, member);

        const profile = await kanvas.member.profile(member);

        const attachment = new KAttachment(profile, {
            name: `profile-${member.id}.png`
        });

        return interaction.editReply({ files: [attachment], components: rows });
    }
}
