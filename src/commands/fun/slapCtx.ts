import {
    AbstractUserMenuCommand,
    UserMenuCommand,
} from "classes/UserMenuCommand";
import type { UserContextMenuCommandInteraction } from "discord.js";
import { ApplicationIntegrationType, InteractionContextType } from "discord.js";
import { nekos } from "utils";

@UserMenuCommand({
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
})
export default class SlapCommand extends AbstractUserMenuCommand {
    async contextMenuRun(interaction: UserContextMenuCommandInteraction) {
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
