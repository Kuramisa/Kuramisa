import { KEmbed, KNumberOption, KUserOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import { ChatInputCommandInteraction, GuildMember } from "discord.js";

@SlashCommand({
    name: "clear",
    description: "Clear messages in a channel",
    guildOnly: true,
    options: [
        new KNumberOption()
            .setName("amount")
            .setDescription("The amount of messages to clear")
            .setMinValue(1)
            .setMaxValue(100),
        new KUserOption()
            .setName("user")
            .setDescription("The user to clear messages from")
            .setRequired(false)
    ]
})
export default class ClearCommand extends AbstractSlashCommand {
    async run(interaction: ChatInputCommandInteraction) {
        if (!interaction.guildId || !interaction.channel) return;
        if (interaction.channel.isDMBased()) return;

        const { channel, options } = interaction;

        const amount = options.getNumber("amount", true);
        const member = options.getMember("user");

        const embed = new KEmbed();

        if (member) {
            if (!(member instanceof GuildMember)) return;

            const messages = (
                await channel.messages.fetch({ limit: amount })
            ).filter((m) => m.author.id === member.id);

            await channel.bulkDelete(messages, true).then((msgs) => {
                embed.setDescription(
                    `Cleared **${msgs.size}** messages from ${member}`
                );
            });

            return interaction.reply({ embeds: [embed] });
        }

        await channel.bulkDelete(amount, true).then((msgs) => {
            embed.setDescription(`Cleared **${msgs.size}** messages`);
        });

        interaction.reply({ embeds: [embed] });
    }
}
