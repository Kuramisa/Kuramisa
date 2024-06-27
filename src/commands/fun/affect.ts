import { AbstractMenuCommand, MenuCommand } from "@classes/MenuCommand";

import {
    ApplicationCommandType,
    ContextMenuCommandInteraction
} from "discord.js";

@MenuCommand({
    name: "It won't affect my baby",
    description: "Won't affect my baby",
    guildOnly: true,
    type: ApplicationCommandType.User
})
export default class AffectCommand extends AbstractMenuCommand {
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

        const {
            kanvas: { images }
        } = this.client;

        const image = await images.affect(
            member.displayAvatarURL({ extension: "png", size: 512 })
        );

        return interaction.reply({
            files: [image]
        });
    }
}
