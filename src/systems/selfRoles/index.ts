import { Modal, ModalRow, TextInput } from "Builders";
import type { ChatInputCommandInteraction } from "discord.js";
import { ChannelType, bold, channelLink, messageLink } from "discord.js";

import SelfRolesButtons from "./buttons";
import SelfRolesMessages from "./messages";

export default class SelfRoles {
    readonly buttons: SelfRolesButtons;
    readonly messages: SelfRolesMessages;

    constructor() {
        this.buttons = new SelfRolesButtons();
        this.messages = new SelfRolesMessages();
    }

    async autoSetup(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { client, options, guild } = interaction;

        const db = await client.managers.guilds.get(guild.id);

        const channelName = options.getString("channel_name", true);
        const wantsCustomMessage = options.getBoolean("custom_message", true);

        const channel = await guild.channels
            .create({
                name: channelName,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: client.user.id ?? "",
                        allow: [
                            "ViewChannel",
                            "SendMessages",
                            "ManageMessages",
                        ],
                    },
                ],
            })
            .catch(() => null);

        if (!channel)
            return interaction.reply({
                content: bold("Failed to create channel!"),
                flags: "Ephemeral",
            });

        if (!wantsCustomMessage) {
            const message = await channel.send({
                content: "Click one of the buttons below to get a role!",
                components: [],
            });

            db.selfRoles.push({
                channelId: channel.id,
                messages: [
                    {
                        id: message.id,
                        buttons: [],
                    },
                ],
            });

            await db.save();

            return interaction.reply({
                content: `**Self roles have been set up in ${channel} - ${messageLink(channel.id, message.id, guild.id)}**`,
                flags: "Ephemeral",
            });
        }

        const modal = new Modal()
            .setCustomId("sr_custom_message_setup")
            .setTitle("Self Roles Custom Message")
            .setComponents(
                new ModalRow().setComponents(
                    new TextInput("long")
                        .setCustomId("sr_custom_message")
                        .setLabel("Custom Message"),
                ),
            );

        await interaction.showModal(modal);

        const mInteraction = await interaction.awaitModalSubmit({ time: 0 });

        const customMessage =
            mInteraction.fields.getTextInputValue("sr_custom_message");

        const message = await channel.send({
            content: customMessage,
            components: [],
        });

        db.selfRoles.push({
            channelId: channel.id,
            messages: [
                {
                    id: message.id,
                    buttons: [],
                },
            ],
        });

        await db.save();

        return mInteraction.reply({
            content: `**Self roles have been set up in ${channel} - ${messageLink(channel.id, message.id, guild.id)}**`,
            flags: "Ephemeral",
        });
    }

    async viewSetups(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { client, guild } = interaction;

        const db = await client.managers.guilds.get(guild.id);

        const { selfRoles } = db;

        if (selfRoles.length === 0)
            return interaction.reply({
                content: bold("No self roles have been set up yet!"),
                flags: "Ephemeral",
            });

        const setups = [];

        for (const roles of selfRoles) {
            const channel =
                guild.channels.cache.get(roles.channelId) ??
                (await guild.channels.fetch(roles.channelId).catch(() => null));

            if (!channel) continue;
            if (!channel.isTextBased()) return;

            const messages = [];
            for (const message of roles.messages) {
                const msg =
                    channel.messages.cache.get(message.id) ??
                    (await channel.messages
                        .fetch(message.id)
                        .catch(() => null));

                if (!msg) continue;

                messages.push(
                    `${bold(
                        messageLink(channel.id, message.id, guild.id),
                    )} - ${message.buttons.length} buttons`,
                );
            }

            setups.push(
                `${bold(channelLink(channel.id, guild.id))} - ${messages.join(
                    "\n",
                )}`,
            );
        }

        return interaction.reply({
            content: `${bold("Self roles setups")}\n\n${setups.join("\n")}`,
            flags: "Ephemeral",
        });
    }
}
