import { AbstractMenuCommand, MenuCommand } from "classes/MenuCommand";
import {
    ApplicationCommandType,
    ContextMenuCommandInteraction,
    InteractionContextType,
} from "discord.js";
import { mockText } from "../../utils/index";

@MenuCommand({
    name: "Mock",
    description: "Mock someone's message",
    contexts: [InteractionContextType.Guild],
    type: ApplicationCommandType.Message,
})
export default class MockCommand extends AbstractMenuCommand {
    async run(interaction: ContextMenuCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { guild, channel, targetId, member } = interaction;

        if (!channel) return;
        const message =
            channel.messages.cache.get(targetId) ||
            (await channel.messages.fetch(targetId).catch(() => null));

        if (!message)
            return interaction.reply({
                content: "Message not found",
                ephemeral: true,
            });

        if (message.content.length < 1)
            return interaction.reply({
                content: "Message is empty",
                ephemeral: true,
            });

        if (
            channel.isThread() ||
            !guild.members.me?.permissions.has("ManageWebhooks")
        )
            return interaction.reply({ content: mockText(message.content) });

        if (message.webhookId != null)
            return interaction.reply({
                content: "I can't mock a webhook message",
                ephemeral: true,
            });

        await interaction.reply({
            content: `Mocked ${message.author}`,
            ephemeral: true,
        });

        const webhook = await channel.createWebhook({
            name: member.displayName,
            avatar: member.displayAvatarURL(),
        });

        await webhook.send({
            content: `${message.member ? message.member.toString() : ""} ${mockText(message.content)}`,
            username: member.displayName,
            avatarURL: member.displayAvatarURL(),
            allowedMentions: { users: [] },
        });

        await webhook.delete();
    }
}
