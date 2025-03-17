import {
    BooleanOption,
    IntegerOption,
    RoleOption,
    StringOption,
} from "@builders";
import { AbstractSlashCommand, SlashCommand } from "classes/SlashCommand";
import {
    ButtonStyle,
    ChatInputCommandInteraction,
    InteractionContextType,
} from "discord.js";

@SlashCommand({
    name: "self-roles",
    description: "Configure self roles for this server",
    contexts: [InteractionContextType.Guild],
    userPermissions: [
        "ManageChannels",
        "ManageRoles",
        "ManageMessages",
        "SendMessages",
        "ReadMessageHistory",
    ],
    botPermissions: [
        "ManageChannels",
        "ManageRoles",
        "ManageMessages",
        "SendMessages",
        "ReadMessageHistory",
    ],
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
                            .setName("sr_channel")
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
                            .setName("sr_channel")
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
                {
                    name: "remove",
                    description: "Remove a message for self roles",
                    options: [
                        new StringOption()
                            .setName("sr_channel")
                            .setDescription(
                                "The name of the channel to remove a message from"
                            )
                            .setAutocomplete(true),
                        new StringOption()
                            .setName("sr_message")
                            .setDescription("The message to remove")
                            .setAutocomplete(true),
                    ],
                },
            ],
        },
        {
            name: "button",
            description: "Add/Remove/Edit buttons for self roles",
            subcommands: [
                {
                    name: "add",
                    description: "Add a button for self roles",
                    options: [
                        new StringOption()
                            .setName("sr_channel")
                            .setDescription(
                                "The name of the channel to add a new button in"
                            )
                            .setAutocomplete(true),
                        new StringOption()
                            .setName("sr_message")
                            .setDescription("The message to add a button to")
                            .setAutocomplete(true),
                        new RoleOption()
                            .setName("sr_button_role")
                            .setDescription(
                                "The role to give when the button is clicked"
                            ),
                        new StringOption()
                            .setName("sr_button_name")
                            .setDescription("The name of the button"),
                        new IntegerOption()
                            .setName("sr_button_style")
                            .setDescription("The style of the button")
                            .setChoices(
                                {
                                    name: "Blurple",
                                    value: ButtonStyle.Primary,
                                },
                                {
                                    name: "Grey",
                                    value: ButtonStyle.Secondary,
                                },
                                {
                                    name: "Green",
                                    value: ButtonStyle.Success,
                                },
                                {
                                    name: "Red",
                                    value: ButtonStyle.Danger,
                                }
                            ),
                        new StringOption()
                            .setName("sr_button_emoji")
                            .setDescription("The emoji of the button")
                            .setRequired(false),
                    ],
                },
                {
                    name: "edit",
                    description: "Edit a button for self roles",
                    options: [
                        new StringOption()
                            .setName("sr_channel")
                            .setDescription(
                                "The name of the channel to edit a button in"
                            )
                            .setAutocomplete(true),
                        new StringOption()
                            .setName("sr_message")
                            .setDescription("The message to edit a button in")
                            .setAutocomplete(true),
                        new StringOption()
                            .setName("sr_button")
                            .setDescription("The button to edit")
                            .setAutocomplete(true),
                        new RoleOption()
                            .setName("sr_button_role")
                            .setDescription(
                                "The role to give when the button is clicked"
                            )
                            .setRequired(false),
                        new StringOption()
                            .setName("sr_button_name")
                            .setDescription("The name of the button")
                            .setRequired(false),
                        new IntegerOption()
                            .setName("sr_button_style")
                            .setDescription("The style of the button")
                            .setChoices(
                                {
                                    name: "Blurple",
                                    value: ButtonStyle.Primary,
                                },
                                {
                                    name: "Grey",
                                    value: ButtonStyle.Secondary,
                                },
                                {
                                    name: "Green",
                                    value: ButtonStyle.Success,
                                },
                                {
                                    name: "Red",
                                    value: ButtonStyle.Danger,
                                }
                            )
                            .setRequired(false),
                        new StringOption()
                            .setName("sr_button_emoji")
                            .setDescription("The emoji of the button")
                            .setRequired(false),
                    ],
                },
                {
                    name: "remove",
                    description: "Remove a button for self roles",
                    options: [
                        new StringOption()
                            .setName("sr_channel")
                            .setDescription(
                                "The name of the channel to remove a button from"
                            )
                            .setAutocomplete(true),
                        new StringOption()
                            .setName("sr_message")
                            .setDescription(
                                "The message to remove a button from"
                            )
                            .setAutocomplete(true),
                        new StringOption()
                            .setName("sr_button")
                            .setDescription("The button to remove")
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
        this.client.systems.selfRoles.messages.messageAdd(interaction);
    }

    slashMessageEdit(interaction: ChatInputCommandInteraction) {
        this.client.systems.selfRoles.messages.messageEdit(interaction);
    }

    slashMessageRemove(interaction: ChatInputCommandInteraction) {
        this.client.systems.selfRoles.messages.messageRemove(interaction);
    }

    slashButtonAdd(interaction: ChatInputCommandInteraction) {
        this.client.systems.selfRoles.buttons.buttonAdd(interaction);
    }

    slashButtonEdit(interaction: ChatInputCommandInteraction) {
        this.client.systems.selfRoles.buttons.buttonEdit(interaction);
    }

    slashButtonRemove(interaction: ChatInputCommandInteraction) {
        this.client.systems.selfRoles.buttons.buttonRemove(interaction);
    }
}
