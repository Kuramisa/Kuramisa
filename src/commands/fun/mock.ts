import { AbstractMenuCommand, MenuCommand } from "@classes/MenuCommand";
import { mockText } from "@utils";
import {
    ApplicationCommandType,
    ContextMenuCommandInteraction
} from "discord.js";

@MenuCommand({
    name: "Mock",
    description: "Mock someone's text",
    guildOnly: true,
    type: ApplicationCommandType.Message
})
export default class MockCommand extends AbstractMenuCommand {
    async run(interaction: ContextMenuCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const { guild, channel, targetId, member } = interaction;

        if (!channel) return;
        const message = await channel.messages.fetch(targetId);

        if (message.content.length < 1)
            return interaction.reply({
                content: "Could not find text in the message",
                ephemeral: true
            });

        if (
            channel.isThread() ||
            !guild.members.me?.permissions.has("ManageWebhooks")
        )
            return interaction.reply({
                content: mockText(message.content)
            });

        if (message.webhookId !== null)
            return interaction.reply({
                content: "Cannot mock a mocked message",
                ephemeral: true
            });

        await interaction.reply({
            content: `Mocked ${message.author}`,
            ephemeral: true
        });

        const webhook = await channel.createWebhook({
            name: member.displayName,
            avatar: member.displayAvatarURL()
        });

        await webhook.send({
            content: `${message.member ? message.member.toString() : ""} ${mockText(message.content)}`,
            username: member.displayName,
            avatarURL: member.displayAvatarURL(),
            allowedMentions: { users: [] }
        });

        await webhook.delete();
    }
}
