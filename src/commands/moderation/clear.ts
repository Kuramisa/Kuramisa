import type { Args } from "@sapphire/framework";
import { Embed, IntegerOption, UserOption } from "Builders";
import { AbstractSlashCommand, SlashCommand } from "classes/SlashCommand";
import type { ChatInputCommandInteraction, Message } from "discord.js";

@SlashCommand({
    name: "clear",
    description: "Clear messages in a channel",
    requiredClientPermissions: ["ManageMessages"],
    requiredUserPermissions: ["ManageMessages"],
    opts: [
        new IntegerOption()
            .setName("amount")
            .setDescription("The amount of messages to clear")
            .setMinValue(2)
            .setMaxValue(100),
        new UserOption()
            .setName("user")
            .setDescription("The user to clear messages from")
            .setRequired(false),
    ],
})
export default class ClearCommand extends AbstractSlashCommand {
    async messageRun(message: Message, args: Args) {
        if (!message.inGuild()) return;

        const { channel } = message;
        const amount = await args.pick("integer").catch(() => null);
        const user = await args.pick("user").catch(() => null);

        if (!amount) {
            return message.reply({
                content: "Please provide an amount of messages to clear",
            });
        }

        const embed = new Embed();

        if (user) {
            const messagesToDelete = (
                await channel.messages.fetch({ limit: amount })
            ).filter((msg) => msg.author.id === user.id);

            const deletedMessages = await channel.bulkDelete(messagesToDelete);

            embed.setDescription(
                `Cleared ${deletedMessages.size} messages from ${user}`,
            );

            return message.reply({ embeds: [embed] });
        }

        const deletedMessages = await channel.bulkDelete(amount);

        embed.setDescription(`Cleared ${deletedMessages.size} messages`);

        return message.reply({ embeds: [embed] });
    }

    async chatInputRun(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        if (!interaction.channel) return;

        const { channel, options } = interaction;

        const amount = options.getInteger("amount", true);
        const user = options.getUser("user", false);

        const embed = new Embed();

        if (user) {
            const messagesToDelete = (
                await channel.messages.fetch({ limit: amount })
            ).filter((msg) => msg.author.id === user.id);

            const deletedMessages = await channel.bulkDelete(messagesToDelete);

            embed.setDescription(
                `Cleared ${deletedMessages.size} messages from ${user}`,
            );

            return interaction.reply({ embeds: [embed], flags: "Ephemeral" });
        }

        const deletedMessages = await channel.bulkDelete(amount);

        embed.setDescription(`Cleared ${deletedMessages.size} messages`);

        return interaction.reply({ embeds: [embed], flags: "Ephemeral" });
    }
}
