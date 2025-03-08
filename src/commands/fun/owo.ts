/* eslint-disable sonarjs/pseudo-random */
import { StringOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "classes/SlashCommand";
import {
    ApplicationIntegrationType,
    ChatInputCommandInteraction,
    InteractionContextType,
} from "discord.js";
import { convert } from "owospeak";

@SlashCommand({
    name: "owo",
    description: "OwOify a text",
    contexts: [
        InteractionContextType.Guild,
        InteractionContextType.BotDM,
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
        const owo = convert(text, {
            tilde: Math.random() < 0.5,
            stutter: Math.random() < 0.5,
        });

        interaction.reply({ content: owo });
    }
}
