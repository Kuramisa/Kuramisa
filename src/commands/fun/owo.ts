 
import { StringOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "classes/SlashCommand";
import {
    ApplicationIntegrationType,
    ChatInputCommandInteraction,
    InteractionContextType,
} from "discord.js";

import { owoify } from "utils";

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
        const owo = owoify(text);

        interaction.reply({ content: owo });
    }
}
