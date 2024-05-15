import { AbstractMenuCommand, MenuCommand } from "@classes/MenuCommand";
import {
    ApplicationCommandType,
    ContextMenuCommandInteraction
} from "discord.js";

@MenuCommand({
    name: "Warn",
    description: "Warn a member",
    type: ApplicationCommandType.User
})
export default class MCommand extends AbstractMenuCommand {
    async run(interaction: ContextMenuCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const {
            moderation: { warns }
        } = this.client;

        const { guild, targetId, member: by } = interaction;

        const member = await guild.members.fetch(targetId);

        if (member.user.bot)
            return interaction.reply({
                content: "**You cannot warn a bot**",
                ephemeral: true
            });

        await interaction.showModal(warns.modal(member));

        const mInteraction = await interaction.awaitModalSubmit({
            time: 0
        });

        const reason = mInteraction.fields.getTextInputValue("warn_reason");

        await warns.create(guild, member, by, reason);

        await mInteraction.reply({
            content: `You warned ${member}`,
            ephemeral: true
        });
    }
}
