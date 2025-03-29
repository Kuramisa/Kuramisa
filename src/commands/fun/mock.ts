import {
    AbstractMessageMenuCommand,
    MessageMenuCommand,
} from "classes/MessageMenuCommand";
import type { MessageContextMenuCommandInteraction } from "discord.js";
import {
    ApplicationIntegrationType,
    InteractionContextType,
    bold,
} from "discord.js";
import { mockText } from "utils/index";

@MessageMenuCommand({
    name: "Mock",
    description: "Mock someone's message",
    contexts: [
        InteractionContextType.Guild,
        InteractionContextType.PrivateChannel,
    ],
    integrations: [
        ApplicationIntegrationType.GuildInstall,
        ApplicationIntegrationType.UserInstall,
    ],
})
export default class MockCommand extends AbstractMessageMenuCommand {
    async run(interaction: MessageContextMenuCommandInteraction) {
        const { targetMessage: message, user } = interaction;

        if (message.webhookId != null)
            return interaction.reply({
                content: bold("I can't mock a webhook message"),
                flags: "Ephemeral",
            });

        if (message.content.length < 1)
            return interaction.reply({
                content: bold("Message is empty"),
                flags: "Ephemeral",
            });

        const { channel } = message;

        if (channel.isThread() || channel.isDMBased())
            return interaction.reply({ content: mockText(message.content) });

        await interaction.reply({
            content: `**Mocked ${message.author}**`,
            flags: "Ephemeral",
        });

        const webhook = await channel.createWebhook({
            name: user.displayName,
            avatar: user.displayAvatarURL(),
        });

        await webhook.send({
            content: `${message.author} ${mockText(message.content)}`,
            username: user.displayName,
            avatarURL: user.displayAvatarURL(),
            flags: "SuppressNotifications",
        });

        await webhook.delete();
    }
}
