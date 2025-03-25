import { StringOption } from "Builders";
import { AbstractSlashCommand, SlashCommand } from "classes/SlashCommand";
import type { ChatInputCommandInteraction } from "discord.js";
import { ApplicationIntegrationType, InteractionContextType } from "discord.js";
import { owoify } from "utils";

@SlashCommand({
    name: "owo",
    description: "OwOify a text",
    contexts: [
        InteractionContextType.Guild,
        InteractionContextType.PrivateChannel,
    ],
    integrations: [
        ApplicationIntegrationType.GuildInstall,
        ApplicationIntegrationType.UserInstall,
    ],
    options: [
        new StringOption().setName("text").setDescription("The text to OwOify"),
    ],
})
export default class OwOCommand extends AbstractSlashCommand {
    async run(interaction: ChatInputCommandInteraction) {
        const text = interaction.options.getString("text", true);
        const owo = owoify(text);

        await interaction.reply({ content: owo });
    }
}
