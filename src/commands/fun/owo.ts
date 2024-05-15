import { KStringOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import { ChatInputCommandInteraction } from "discord.js";
import { convert } from "owospeak";

const converOpts = {
    tilde: Math.random() < 0.5,
    stutter: Math.random() < 0.5
};

@SlashCommand({
    name: "owo",
    description: "OwOify a text",
    options: [
        new KStringOption()
            .setName("text")
            .setDescription("The text to OwOify")
            .setRequired(true)
    ]
})
export default class PingCommand extends AbstractSlashCommand {
    async run(interaction: ChatInputCommandInteraction) {
        const text = interaction.options.getString("text", true);
        const owo = convert(text, converOpts);

        interaction.reply({ content: owo });
    }
}
