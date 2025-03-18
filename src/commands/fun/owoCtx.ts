import { AbstractMenuCommand, MenuCommand } from "classes/MenuCommand";
import {
    ApplicationCommandType,
    ApplicationIntegrationType,
    bold,
    ContextMenuCommandInteraction,
    InteractionContextType,
} from "discord.js";

import { owoify } from "utils";

@MenuCommand({
    name: "OwOify",
    description: "OwOify a message",
    contexts: [
        InteractionContextType.PrivateChannel,
        InteractionContextType.Guild,
    ],
    integrations: [
        ApplicationIntegrationType.GuildInstall,
        ApplicationIntegrationType.UserInstall,
    ],
    type: ApplicationCommandType.Message,
})
export default class OwOCtxCommand extends AbstractMenuCommand {
    async run(interaction: ContextMenuCommandInteraction) {
        if (!interaction.isMessageContextMenuCommand()) return;
        const { targetMessage: message } = interaction;

        if (message.content.length < 1)
            return interaction.reply({
                content: bold("Could not find text in the message"),
                flags: "Ephemeral",
            });

        const owo = owoify(message.content);
        return interaction.reply({ content: owo });
    }
}
