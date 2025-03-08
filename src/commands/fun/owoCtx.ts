/* eslint-disable sonarjs/pseudo-random */
import { AbstractMenuCommand, MenuCommand } from "classes/MenuCommand";
import {
    ApplicationCommandType,
    ApplicationIntegrationType,
    ContextMenuCommandInteraction,
    InteractionContextType,
} from "discord.js";
import { convert } from "owospeak";

@MenuCommand({
    name: "OwOify",
    description: "OwOify a message",
    contexts: [
        InteractionContextType.BotDM,
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
        const { channel, targetId } = interaction;

        if (!channel) return;
        const message = await channel.messages.fetch(targetId);

        if (message.content.length < 1)
            return interaction.reply({
                content: "Could not find text in the message",
                ephemeral: true,
            });

        const owo = convert(message.content, {
            tilde: Math.random() < 0.5,
            stutter: Math.random() < 0.5,
        });

        return interaction.reply({ content: owo });
    }
}
