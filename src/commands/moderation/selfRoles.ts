import {
    KBooleanOption,
    KNumberOption,
    KRoleOption,
    KStringOption
} from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import { ButtonStyle, ChatInputCommandInteraction } from "discord.js";

@SlashCommand({
    name: "self-roles",
    description: "Configure self-roles for the server",
    subcommands: [
        {
            name: "setup",
            description:
                "Automatically setup the channel and the message for self roles",
            options: [
                new KStringOption()
                    .setName("channel_name")
                    .setDescription(
                        "The name of the channel to create for self roles"
                    )
                    .setRequired(true),
                new KBooleanOption()
                    .setName("custom_message")
                    .setDescription(
                        "Whether to use a custom message for self roles"
                    )
                    .setRequired(true)
            ]
        }
        // TODO: Add view command
    ],
    groups: [
        {
            name: "message",
            description: "Add/Remove/Edit message(s) for self-roles",
            subcommands: [
                {
                    name: "add",
                    description: "Add a message for self-roles",
                    options: [
                        new KStringOption()
                            .setName("sr_channel_name")
                            .setDescription(
                                "The name of the channel to add a new message in"
                            )
                            .setAutocomplete(true)
                            .setRequired(true),
                        new KBooleanOption()
                            .setName("custom_message")
                            .setDescription(
                                "Whether to use a custom message for self roles"
                            )
                            .setRequired(true)
                    ]
                },
                {
                    name: "remove",
                    description: "Remove a message for self-roles",
                    options: [
                        new KStringOption()
                            .setName("sr_channel_name")
                            .setDescription(
                                "The name of the channel to remove a message from"
                            )
                            .setAutocomplete(true)
                            .setRequired(true),
                        new KStringOption()
                            .setName("sr_message")
                            .setDescription("The message to remove")
                            .setAutocomplete(true)
                            .setRequired(true)
                    ]
                },
                {
                    name: "edit",
                    description: "Edit a message for self-roles",
                    options: [
                        new KStringOption()
                            .setName("sr_channel_name")
                            .setDescription(
                                "The name of the channel to edit a message in"
                            )
                            .setAutocomplete(true)
                            .setRequired(true),
                        new KStringOption()
                            .setName("sr_message")
                            .setDescription("The message to edit")
                            .setAutocomplete(true)
                            .setRequired(true),
                        new KBooleanOption()
                            .setName("custom_message")
                            .setDescription(
                                "Whether to use a custom message for self roles"
                            )
                            .setRequired(true)
                    ]
                }
            ]
        },
        {
            // TODO: add view command and edit command
            name: "buttons",
            description: "Add/Remove/Edit buttons for self-roles",
            subcommands: [
                {
                    name: "add",
                    description: "Add a button for self-roles",
                    options: [
                        new KStringOption()
                            .setName("sr_channel_name")
                            .setDescription(
                                "The name of the channel to add a new button in"
                            )
                            .setAutocomplete(true)
                            .setRequired(true),
                        new KStringOption()
                            .setName("sr_message")
                            .setDescription("The message to add the button to")
                            .setAutocomplete(true)
                            .setRequired(true),
                        new KRoleOption()
                            .setName("button_role")
                            .setDescription("The role the button will give")
                            .setRequired(true),
                        new KStringOption()
                            .setName("button_name")
                            .setDescription("The name of the button")
                            .setRequired(true),
                        new KNumberOption()
                            .setName("button_style")
                            .setDescription("The style of the button")
                            .setChoices(
                                {
                                    name: "Blurple",
                                    value: ButtonStyle.Primary
                                },
                                {
                                    name: "Grey",
                                    value: ButtonStyle.Secondary
                                },
                                {
                                    name: "Green",
                                    value: ButtonStyle.Success
                                },
                                {
                                    name: "Red",
                                    value: ButtonStyle.Danger
                                }
                            )
                            .setRequired(true),
                        new KStringOption()
                            .setName("button_emoji")
                            .setDescription("The emoji of the button")
                            .setRequired(false)
                    ]
                },
                {
                    name: "remove",
                    description: "Remove a button for self-roles",
                    options: [
                        new KStringOption()
                            .setName("sr_channel_name")
                            .setDescription(
                                "The name of the channel to remove a button from"
                            )
                            .setAutocomplete(true)
                            .setRequired(true),
                        new KStringOption()
                            .setName("sr_message")
                            .setDescription(
                                "The message to remove the button from"
                            )
                            .setAutocomplete(true)
                            .setRequired(true)

                        // TODO: Add autocomplete for buttons
                        /*new KStringOption()
                            .setName("button_name")
                            .setDescription("The name of the button")
                            .setRequired(false)
                            .setAutocomplete(true)*/
                    ]
                }
            ]
        }
    ]
})
export default class PingCommand extends AbstractSlashCommand {
    async slashSetup(interaction: ChatInputCommandInteraction) {
        this.client.moderation.selfRoles.setup(interaction);
    }

    async slashMessageAdd(interaction: ChatInputCommandInteraction) {
        this.client.moderation.selfRoles.addMessage(interaction);
    }

    async slashMessageRemove(interaction: ChatInputCommandInteraction) {
        this.client.moderation.selfRoles.removeMessage(interaction);
    }

    async slashMessageEdit(interaction: ChatInputCommandInteraction) {
        this.client.moderation.selfRoles.editMessage(interaction);
    }

    async slashButtonAdd(interaction: ChatInputCommandInteraction) {
        this.client.moderation.selfRoles.addButton(interaction);
    }

    async slashButtonRemove(interaction: ChatInputCommandInteraction) {
        this.client.moderation.selfRoles.removeButton(interaction);
    }

    /*
    async slashButtonEdit(interaction: ChatInputCommandInteraction) {
        this.client.moderation.selfRoles.editButton(interaction);
    }
    */
}
