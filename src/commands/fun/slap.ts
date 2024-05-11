import { AbstractMenuCommand, MenuCommand } from "@classes/MenuCommand";
import { nekos } from "@utils";
import {
    ApplicationCommandType,
    ContextMenuCommandInteraction
} from "discord.js";

@MenuCommand({
    name: "Slap",
    description: "Slap someone",
    type: ApplicationCommandType.User
})
export default class OwOCommand extends AbstractMenuCommand {
    async run(interaction: ContextMenuCommandInteraction) {
        if (!interaction.guild) return;

        const { guild, targetId, user } = interaction;
        const member = await guild.members.fetch(targetId).catch(() => null);
        if (!member)
            return interaction.reply({
                content: "**Member not found**",
                ephemeral: true
            });
        if (member.user.bot)
            return interaction.reply({
                content: "Bots don't have feelings",
                ephemeral: true
            });

        if (member.id === user.id)
            return interaction.reply({
                content: "Don't be mean to yourself",
                ephemeral: true
            });

        const slap = await nekos.slap();

        return interaction.reply({
            content: `${user.toString()} slapped ${member.toString()}`,
            files: [slap.url]
        });
    }
}
