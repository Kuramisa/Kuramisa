import { AbstractMenuCommand, MenuCommand } from "classes/MenuCommand";
import {
    ApplicationCommandType,
    ApplicationIntegrationType,
    ContextMenuCommandInteraction,
    InteractionContextType,
} from "discord.js";
import { nekos } from "utils";

@MenuCommand({
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
    type: ApplicationCommandType.User,
})
export default class PatCommand extends AbstractMenuCommand {
    async run(interaction: ContextMenuCommandInteraction) {
        if (!interaction.isUserContextMenuCommand()) return;

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
