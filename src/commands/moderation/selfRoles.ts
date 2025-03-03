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
                    .setDescription("Whether to use a custom message"),
            ],
        },
        {
            name: "view-setups",
            description: "View self roles setups for this server",
        },
    ],
    groups: [
        {
            name: "message",
            description: "Add/Remove/Edit message(s) for self roles",
            subcommands: [
                {
                    name: "add",
                    description: "Add a message for self roles",
                    options: [
                        new StringOption()
                            .setName("sr_channel_name")
                            .setDescription(
                                "The name of the channel to add a new message in"
                            )
                            .setAutocomplete(true),
                        new BooleanOption()
                            .setName("custom_message")
                            .setDescription("Whether to use a custom message"),
                    ],
                },
                {
                    name: "edit",
                    description: "Edit a message for self roles",
                    options: [
                        new StringOption()
                            .setName("sr_channel_name")
                            .setDescription(
                                "The name of the channel to edit a message in"
                            )
                            .setAutocomplete(true),
                        new StringOption()
                            .setName("sr_message")
                            .setDescription("The message to edit")
                            .setAutocomplete(true),
                    ],
                },
            ],
        },
    ],
})
export default class SelfRolesCommand extends AbstractSlashCommand {
    slashAutoSetup(interaction: ChatInputCommandInteraction) {
        this.client.systems.selfRoles.autoSetup(interaction);
    }

    slashViewSetups(interaction: ChatInputCommandInteraction) {
        this.client.systems.selfRoles.viewSetups(interaction);
    }

    slashMessageAdd(interaction: ChatInputCommandInteraction) {
        this.client.systems.selfRoles.messageAdd(interaction);
    }

    slashMessageEdit(interaction: ChatInputCommandInteraction) {
        this.client.systems.selfRoles.messageEdit(interaction);
    }
}
