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
    name: "slap",
    description: "Slap someone!",
    contexts: [
        InteractionContextType.Guild,
        InteractionContextType.PrivateChannel,
    ],
    integrations: [
        ApplicationIntegrationType.GuildInstall,
        ApplicationIntegrationType.UserInstall,
    ],
    options: [
        new UserOption().setName("user").setDescription("The user to slap"),
        new BooleanOption()
            .setName("notify_them")
            .setDescription("Notify the user"),
    ],
})
export default class SlapCommand extends AbstractSlashCommand {
    async run(interaction: ChatInputCommandInteraction) {
        const { options } = interaction;

        const user = options.getUser("user", true);

        if (user.id === interaction.user.id)
            return interaction.reply({
                content: bold("You can't slap yourself silly"),
                flags: "Ephemeral",
            });

        const slap = await nekos.slap();
        const notifyThem = options.getBoolean("notify_them", true);

        return interaction.reply({
            content: `${interaction.user} slapped ${user}`,
            files: [slap.url],
            flags: notifyThem ? [] : ["SuppressNotifications"],
        });
    }
}
