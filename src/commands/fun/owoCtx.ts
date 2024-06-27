import { AbstractMenuCommand, MenuCommand } from "@classes/MenuCommand";
import {
    ApplicationCommandType,
    ContextMenuCommandInteraction
} from "discord.js";
import { convert } from "owospeak";

const converOpts = {
    tilde: Math.random() < 0.5,
    stutter: Math.random() < 0.5
};

@MenuCommand({
    name: "OwOify",
    description: "OwOify a message",
    guildOnly: true,
    type: ApplicationCommandType.Message
})
export default class OwOCtxCommand extends AbstractMenuCommand {
    async run(interaction: ContextMenuCommandInteraction) {
        const { channel, targetId } = interaction;

        if (!channel) return;
        const message = await channel.messages.fetch(targetId);

        if (message.content.length < 1)
            return interaction.reply({
                content: "Could not find text in the message",
                ephemeral: true
            });

        const owo = convert(message.content, converOpts);

        return interaction.reply({ content: owo });
    }
}
