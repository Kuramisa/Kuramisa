import {
    BooleanOption,
    IntegerOption,
    RoleOption,
    StringOption,
} from "Builders";
import {
    AbstractSlashSubcommand,
    SlashSubcommand,
} from "classes/SlashSubcommand";
import { ButtonStyle, type ChatInputCommandInteraction } from "discord.js";

@SlashSubcommand({
    name: "self-roles",
    description: "Configure self roles for this server",
    requiredUserPermissions: [
        "ManageChannels",
        "ManageRoles",
        "ManageMessages",
        "SendMessages",
        "ReadMessageHistory",
    ],
    requiredClientPermissions: [
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
            chatInputRun: "slashAutoSetup",
            opts: [
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
            chatInputRun: "slashViewSetups",
        },
        {
            name: "message",
            description: "Add/Remove/Edit message(s) for self roles",
            type: "group",
            entries: [
                {
                    name: "add",
                    description: "Add a message for self roles",
                    chatInputRun: "slashMessageAdd",
                    opts: [
                        new StringOption()
                            .setName("sr_channel")
                            .setDescription(
                                "The name of the channel to add a new message in",
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
                    chatInputRun: "slashMessageEdit",
                    opts: [
                        new StringOption()
                            .setName("sr_channel")
                            .setDescription(
                                "The name of the channel to edit a message in",
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
                    chatInputRun: "slashMessageRemove",
                    opts: [
                        new StringOption()
                            .setName("sr_channel")
                            .setDescription(
                                "The name of the channel to remove a message from",
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
            type: "group",
            entries: [
                {
                    name: "add",
                    description: "Add a button for self roles",
                    chatInputRun: "slashButtonAdd",
                    opts: [
                        new StringOption()
                            .setName("sr_channel")
                            .setDescription(
                                "The name of the channel to add a new button in",
                            )
                            .setAutocomplete(true),
                        new StringOption()
                            .setName("sr_message")
                            .setDescription("The message to add a button to")
                            .setAutocomplete(true),
                        new RoleOption()
                            .setName("sr_button_role")
                            .setDescription(
                                "The role to give when the button is clicked",
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
                                },
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
                    chatInputRun: "slashButtonEdit",
                    opts: [
                        new StringOption()
                            .setName("sr_channel")
                            .setDescription(
                                "The name of the channel to edit a button in",
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
                                "The role to give when the button is clicked",
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
                                },
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
                    chatInputRun: "slashButtonRemove",
                    opts: [
                        new StringOption()
                            .setName("sr_channel")
                            .setDescription(
                                "The name of the channel to remove a button from",
                            )
                            .setAutocomplete(true),
                        new StringOption()
                            .setName("sr_message")
                            .setDescription(
                                "The message to remove a button from",
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
export default class SelfRolesCommand extends AbstractSlashSubcommand {
    async slashAutoSetup(interaction: ChatInputCommandInteraction) {
        await interaction.client.systems.selfRoles.autoSetup(interaction);
    }

    async slashViewSetups(interaction: ChatInputCommandInteraction) {
        await interaction.client.systems.selfRoles.viewSetups(interaction);
    }

    async slashMessageAdd(interaction: ChatInputCommandInteraction) {
        await interaction.client.systems.selfRoles.messages.messageAdd(
            interaction,
        );
    }

    async slashMessageEdit(interaction: ChatInputCommandInteraction) {
        await interaction.client.systems.selfRoles.messages.messageEdit(
            interaction,
        );
    }

    async slashMessageRemove(interaction: ChatInputCommandInteraction) {
        await interaction.client.systems.selfRoles.messages.messageRemove(
            interaction,
        );
    }

    async slashButtonAdd(interaction: ChatInputCommandInteraction) {
        await interaction.client.systems.selfRoles.buttons.buttonAdd(
            interaction,
        );
    }

    async slashButtonEdit(interaction: ChatInputCommandInteraction) {
        await interaction.client.systems.selfRoles.buttons.buttonEdit(
            interaction,
        );
    }

    async slashButtonRemove(interaction: ChatInputCommandInteraction) {
        await interaction.client.systems.selfRoles.buttons.buttonRemove(
            interaction,
        );
    }
}
