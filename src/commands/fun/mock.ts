import { AbstractMenuCommand, MenuCommand } from "classes/MenuCommand";
import {
    ApplicationCommandType,
    ApplicationIntegrationType,
    bold,
    ContextMenuCommandInteraction,
    InteractionContextType,
} from "discord.js";
import { mockText } from "../../utils/index";

@MenuCommand({
    name: "Mock",
    description: "Mock someone's message",
    contexts: [
        InteractionContextType.Guild,
        InteractionContextType.BotDM,
        InteractionContextType.PrivateChannel,
    ],
    integrations: [
        ApplicationIntegrationType.GuildInstall,
        ApplicationIntegrationType.UserInstall,
    ],
    type: ApplicationCommandType.Message,
})
export default class MockCommand extends AbstractMenuCommand {
    async run(interaction: ContextMenuCommandInteraction) {
        const { channel, targetId, user } = interaction;

        if (!channel) return;
        if (!channel.isTextBased()) return;

        const message =
            channel.messages.cache.get(targetId) ||
            (await channel.messages.fetch(targetId).catch(() => null));

        if (!message)
            return interaction.reply({
                content: bold("Message not found"),
                flags: ["Ephemeral"],
            });

        if (message.content.length < 1)
            return interaction.reply({
                content: bold("Message is empty"),
                flags: ["Ephemeral"],
            });

        if (channel.isThread())
            return interaction.reply({ content: mockText(message.content) });

        if (message.webhookId != null)
            return interaction.reply({
                content: bold("I can't mock a webhook message"),
                flags: ["Ephemeral"],
            });

        await interaction.reply({
            content: bold(`Mocked ${message.author}`),
            flags: ["Ephemeral"],
        });

        if (channel.isDMBased()) {
            await message.reply({
                content: `${message.author ? message.author.toString() : ""} ${mockText(message.content)}`,
            });

            return;
        }

        const webhook = await channel.createWebhook({
            name: user.displayName,
            avatar: user.displayAvatarURL(),
        });

        await webhook.send({
            content: `${message.author ? message.author.toString() : ""} ${mockText(message.content)}`,
            username: user.displayName,
            avatarURL: user.displayAvatarURL(),
            allowedMentions: { users: [] },
        });

        await webhook.delete();
    }
}
