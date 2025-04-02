import { BooleanOption, UserOption } from "Builders";
import { AbstractSlashCommand, SlashCommand } from "classes/SlashCommand";
import type { ChatInputCommandInteraction } from "discord.js";
import {
    ApplicationIntegrationType,
    InteractionContextType,
    bold,
} from "discord.js";
import { nekos } from "utils";

@SlashCommand({
    name: "pat",
    description: "Pat someone!",
    contexts: [
        InteractionContextType.Guild,
        InteractionContextType.PrivateChannel,
    ],
    integrations: [
        ApplicationIntegrationType.GuildInstall,
        ApplicationIntegrationType.UserInstall,
    ],
    opts: [
        new UserOption().setName("user").setDescription("The user to pat"),
        new BooleanOption()
            .setName("notify_them")
            .setDescription("Notify the user"),
    ],
})
export default class PatCommand extends AbstractSlashCommand {
    async run(interaction: ChatInputCommandInteraction) {
        const { options } = interaction;

        const user = options.getUser("user", true);

        if (user.id === interaction.user.id)
            return interaction.reply({
                content: bold("You can't pat yourself silly"),
                flags: "Ephemeral",
            });

        const pat = await nekos.pat();
        const notifyThem = options.getBoolean("notify_them", true);

        return interaction.reply({
            content: `${interaction.user} patted ${user}`,
            files: [pat.url],
            flags: notifyThem ? [] : ["SuppressNotifications"],
        });
    }
}
