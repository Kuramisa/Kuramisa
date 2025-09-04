import { StringOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import type { Args } from "@sapphire/framework";
import { owoify } from "@utils";
import type { ChatInputCommandInteraction, Message } from "discord.js";
import { ApplicationIntegrationType, InteractionContextType } from "discord.js";

@SlashCommand({
    name: "owo",
    aliases: ["owofy"],
    description: "OwOify a text",
    contexts: [
        InteractionContextType.Guild,
        InteractionContextType.PrivateChannel,
    ],
    integrations: [
        ApplicationIntegrationType.GuildInstall,
        ApplicationIntegrationType.UserInstall,
    ],
    opts: [
        new StringOption().setName("text").setDescription("The text to OwOify"),
    ],
})
export default class OwOCommand extends AbstractSlashCommand {
    async messageRun(message: Message, args: Args) {
        const text = await args.rest("string").catch(() => null);
        if (!text)
            return message.reply({
                content: "Please provide a text to OwOify",
            });
        const owo = owoify(text);

        await message.reply({ content: owo });
    }

    async chatInputRun(interaction: ChatInputCommandInteraction) {
        const text = interaction.options.getString("text", true);
        const owo = owoify(text);

        await interaction.reply({ content: owo });
    }
}
