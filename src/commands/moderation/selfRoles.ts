import { BooleanOption, StringOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "classes/SlashCommand";
import {
    ChatInputCommandInteraction,
    InteractionContextType,
} from "discord.js";

@SlashCommand({
    name: "self-roles",
    description: "Configure self roles for this server",
    contexts: [InteractionContextType.Guild],
    subcommands: [
        {
            name: "auto-setup",
            description: "Automatically set up self roles for this server",
            options: [
                new StringOption()
                    .setName("channel_name")
                    .setDescription("The name of the channel to create"),
                new BooleanOption()
                    .setName("custom_message")
                    .setDescription("Whether to use a custom message")
                    .setRequired(false),
            ],
        },
    ],
})
export default class SelfRolesCommand extends AbstractSlashCommand {
    slashAutoSetup(interaction: ChatInputCommandInteraction) {
        this.client.systems.selfRoles.autoSetup(interaction);
    }
}
