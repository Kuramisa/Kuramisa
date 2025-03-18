import { AbstractMenuCommand, MenuCommand } from "classes/MenuCommand";
import {
    ApplicationCommandType,
    ApplicationIntegrationType,
    ContextMenuCommandInteraction,
    InteractionContextType,
} from "discord.js";
import { nekos } from "utils";

@MenuCommand({
    name: "Slap",
    description: "Slap 'em!",
    contexts: [
        InteractionContextType.Guild,
        InteractionContextType.PrivateChannel,
    ],
    integrations: [
        ApplicationIntegrationType.GuildInstall,
        ApplicationIntegrationType.UserInstall,
    ],
    type: ApplicationCommandType.User,
})
export default class SlapCommand extends AbstractMenuCommand {
    async run(interaction: ContextMenuCommandInteraction) {
        if (!interaction.isUserContextMenuCommand()) return;

        const { targetUser, user } = interaction;

        if (targetUser.id === user.id)
            return interaction.reply({
                content: "You can't slap yourself silly",
                flags: "Ephemeral",
            });

        const slap = await nekos.slap();

        return interaction.reply({
            content: `${user} slapped ${targetUser}`,
            files: [slap.url],
        });
    }
}
