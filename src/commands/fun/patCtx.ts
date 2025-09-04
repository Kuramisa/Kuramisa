import {
    AbstractUserMenuCommand,
    UserMenuCommand,
} from "@classes/UserMenuCommand";
import { nekos } from "@utils";
import type { UserContextMenuCommandInteraction } from "discord.js";
import { ApplicationIntegrationType, InteractionContextType } from "discord.js";

@UserMenuCommand({
    name: "Pat",
    description: "Pat 'em!",
    contexts: [
        InteractionContextType.Guild,
        InteractionContextType.PrivateChannel,
    ],
    integrations: [
        ApplicationIntegrationType.GuildInstall,
        ApplicationIntegrationType.UserInstall,
    ],
})
export default class PatCommand extends AbstractUserMenuCommand {
    async contextMenuRun(interaction: UserContextMenuCommandInteraction) {
        const { targetUser, user } = interaction;

        if (targetUser.id === user.id)
            return interaction.reply({
                content: "You can't pat yourself silly",
                flags: "Ephemeral",
            });

        const pat = await nekos.pat();

        return interaction.reply({
            content: `${user} patted ${targetUser}`,
            files: [pat.url],
        });
    }
}
