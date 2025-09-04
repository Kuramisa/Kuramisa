import {
    AbstractMessageMenuCommand,
    MessageMenuCommand,
} from "@classes/MessageMenuCommand";
import { owoify } from "@utils";
import type { MessageContextMenuCommandInteraction } from "discord.js";
import {
    ApplicationIntegrationType,
    InteractionContextType,
    bold,
} from "discord.js";

@MessageMenuCommand({
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
})
export default class OwOCtxCommand extends AbstractMessageMenuCommand {
    async contextMenuRun(interaction: MessageContextMenuCommandInteraction) {
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
