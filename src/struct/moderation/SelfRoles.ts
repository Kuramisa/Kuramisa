import kuramisa from "@kuramisa";
import {
    KButton,
    KModal,
    KModalRow,
    KRow,
    KStringDropdown,
    KTextInput
} from "@builders";

import {
    ChannelType,
    type ChatInputCommandInteraction,
    ComponentType,
    TextInputStyle
} from "discord.js";

export default class SelfRoles {
    private setupMessage =
        "You need to setup at least one channel for self roles first!";

    // Set up the self roles channel and message
    async setup(interaction: ChatInputCommandInteraction) {
        const { database } = kuramisa;

        const { options, guild } = interaction;
        if (!guild) return;

        const db = await database.guilds.fetch(guild.id);

        const channelName = options.getString("channel_name", true);
        const customMessage = options.getBoolean("custom_message", true);

        const channel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone,
                    deny: ["SendMessages"]
                },
                {
                    id: guild.members.me?.id as string,
                    allow: ["SendMessages"]
                }
            ]
        });

        if (!customMessage) {
            const message = await channel.send({
                content: "React to the buttons below to get the roles!",
                components: []
            });

            db.selfRoles.push({
                channelId: channel.id,
                messages: [
                    {
                        id: message.id,
                        buttons: []
                    }
                ]
            } as any);

            await db.save();

            return interaction.reply({
                content: `Set up self roles finished!\n${channel}`,
                ephemeral: true
            });
        }

        const modal = new KModal()
            .setCustomId("self_roles_custom_message")
            .setTitle("Self Roles Setup")
            .setComponents(
                new KModalRow().setComponents(
                    new KTextInput()
                        .setCustomId("custom_message")
                        .setLabel("Custom Message")
                        .setStyle(TextInputStyle.Paragraph)
                )
            );

        await interaction.showModal(modal);

        const mInteraction = await interaction.awaitModalSubmit({ time: 0 });

        const cstmMessage =
            mInteraction.fields.getTextInputValue("custom_message");

        const message = await channel.send({
            content: cstmMessage,
            components: []
        });

        db.selfRoles.push({
            channelId: channel.id,
            messages: [
                {
                    id: message.id,
                    buttons: []
                }
            ]
        } as any);

        await db.save();

        return mInteraction.reply({
            content: `Set up self roles finished!\n${channel}`,
            ephemeral: true
        });
    }

    async addMessage(interaction: ChatInputCommandInteraction) {
        const { database } = kuramisa;

        const { options, guild } = interaction;
        if (!guild) return;

        const db = await database.guilds.fetch(guild.id);

        if (db.selfRoles.length < 1)
            return interaction.reply({
                content: this.setupMessage,
                ephemeral: true
            });

        const channelId = options.getString("sr_channel_name", true);
        const channel = await guild.channels.fetch(channelId);
        if (!channel) return;
        if (!channel.isTextBased()) return;

        const dbChannel = db.selfRoles.find(
            (sr) => (sr.channelId = channel.id)
        );
        if (!dbChannel) return;

        const customMessage = options.getBoolean("custom_message", true);

        if (!customMessage) {
            const message = await channel.send({
                content: "React to the buttons below to get the roles!",
                components: []
            });

            dbChannel.messages.push({
                id: message.id,
                buttons: []
            });

            db.markModified("selfroles");
            await db.save();

            return interaction.reply({
                content: `Added a message to ${channel}`,
                ephemeral: true
            });
        }

        const modal = new KModal()
            .setCustomId("self_roles_custom_message")
            .setTitle("Self Roles Setup")
            .setComponents(
                new KModalRow().setComponents(
                    new KTextInput()
                        .setCustomId("custom_message")
                        .setLabel("Custom Message")
                        .setStyle(TextInputStyle.Paragraph)
                )
            );

        await interaction.showModal(modal);

        const mInteraction = await interaction.awaitModalSubmit({ time: 0 });

        const cstmMessage =
            mInteraction.fields.getTextInputValue("custom_message");

        const message = await channel.send({
            content: cstmMessage,
            components: []
        });

        dbChannel.messages.push({
            id: message.id,
            buttons: []
        });

        db.markModified("selfroles");
        await db.save();

        return mInteraction.reply({
            content: `Added a message to ${channel}`,
            ephemeral: true
        });
    }

    async removeMessage(interaction: ChatInputCommandInteraction) {
        const { database } = kuramisa;

        const { options, guild } = interaction;
        if (!guild) return;

        const db = await database.guilds.fetch(guild.id);

        if (db.selfRoles.length < 1)
            return interaction.reply({
                content: this.setupMessage,
                ephemeral: true
            });

        const channelId = options.getString("sr_channel_name", true);
        const messageId = options.getString("sr_message", true);

        const channel = await guild.channels.fetch(channelId);
        if (!channel) return;
        if (!channel.isTextBased()) return;

        const dbChannel = db.selfRoles.find(
            (sr) => (sr.channelId = channel.id)
        );
        if (!dbChannel) return;

        const message = await channel.messages.fetch(messageId);
        if (!message) return;

        await message.delete();

        dbChannel.messages = dbChannel.messages.filter(
            (msg) => msg.id !== message.id
        );

        db.markModified("selfroles");
        await db.save();

        return interaction.reply({
            content: `Removed a message from ${channel}`,
            ephemeral: true
        });
    }

    async editMessage(interaction: ChatInputCommandInteraction) {
        const { database } = kuramisa;

        const { options, guild } = interaction;
        if (!guild) return;

        const db = await database.guilds.fetch(guild.id);

        if (db.selfRoles.length < 1)
            return interaction.reply({
                content: this.setupMessage,
                ephemeral: true
            });

        const channelId = options.getString("sr_channel_name", true);
        const messageId = options.getString("sr_message", true);

        const channel = await guild.channels.fetch(channelId);
        if (!channel) return;
        if (!channel.isTextBased()) return;

        const message = await channel.messages.fetch(messageId);
        if (!message) return;

        const modal = new KModal()
            .setCustomId("self_roles_new_custom_message")
            .setTitle("Editing Self Roles Message")
            .setComponents(
                new KModalRow().setComponents(
                    new KTextInput()
                        .setCustomId("new_custom_message")
                        .setLabel("New Custom Message")
                        .setStyle(TextInputStyle.Paragraph)

                        .setValue(message.content)
                )
            );

        await interaction.showModal(modal);

        const mInteraction = await interaction.awaitModalSubmit({ time: 0 });

        const newCustomMessage =
            mInteraction.fields.getTextInputValue("new_custom_message");

        await message.edit({
            content: newCustomMessage
        });

        return mInteraction.reply({
            content: `Edited a message from ${channel}`,
            ephemeral: true
        });
    }

    async addButton(interaction: ChatInputCommandInteraction) {
        const { database, logger } = kuramisa;

        const { options, guild } = interaction;
        if (!guild) return;

        const db = await database.guilds.fetch(guild.id);

        if (db.selfRoles.length < 1)
            return interaction.reply({
                content: this.setupMessage,
                ephemeral: true
            });

        await interaction.deferReply({ ephemeral: true });

        const channelId = options.getString("sr_channel_name", true);

        const channel = await guild.channels.fetch(channelId);
        if (!channel) return;
        if (!channel.isTextBased()) return;

        const dbChannel = db.selfRoles.find(
            (sr) => sr.channelId === channel.id
        );

        if (!dbChannel) return;

        const messageId = options.getString("sr_message", true);
        // Message fetched from the cache
        const msg = await channel.messages.fetch(messageId);

        if (msg.components.length === 5)
            return interaction.editReply({
                content: "You can't add more than 25 buttons!"
            });

        const role = options.getRole("button_role", true);
        const buttonName = options.getString("button_name", true);
        const buttonStyle = options.getNumber("button_style", true);
        const buttonEmoji = options.getString("button_emoji");
        const buttonId = buttonName
            .toLowerCase()
            .split(" ")
            .join("-")
            .concat("_sr");

        const dbMessage = dbChannel.messages.find(
            (srMsg) => srMsg.id === msg.id
        );

        if (!dbMessage) return;

        const button = new KButton()
            .setCustomId(buttonId)
            .setLabel(buttonName)
            .setStyle(buttonStyle);

        if (buttonEmoji) button.setEmoji(buttonEmoji);

        try {
            const latestRow = msg.components.at(-1) as any;
            if (!latestRow) {
                const row = new KRow().addComponents(button) as any;
                msg.components.push(row);

                await msg.edit({ components: [row] });

                dbMessage.buttons.push({
                    id: buttonId,
                    name: buttonName,
                    roleId: role.id,
                    emoji: buttonEmoji,
                    style: buttonStyle
                });

                db.markModified("selfroles");
                await db.save();

                return interaction.editReply({
                    content: `Added button ${buttonName} to ${msg}`
                });
            }

            if (latestRow.components.length === 5) {
                const newRow = new KRow().addComponents(button) as any;
                msg.components.push(newRow);
            }

            if (latestRow.components.length < 5) {
                latestRow.components.push(button);
            }

            await msg.edit({ components: msg.components });

            dbMessage.buttons.push({
                id: buttonId,
                name: buttonName,
                roleId: role.id,
                emoji: buttonEmoji,
                style: buttonStyle
            });

            db.markModified("selfroles");
            await db.save();

            return interaction.editReply({
                content: `Added button ${buttonName} to ${msg}`
            });
        } catch (err: any) {
            logger.error(err);

            if (err.message.includes("duplicated"))
                return interaction.editReply({
                    content: "This button already exists!"
                });

            return interaction.editReply({
                content: "Something went wrong! Please try again."
            });
        }
    }

    async removeButton(interaction: ChatInputCommandInteraction) {
        const { database } = kuramisa;

        const { options, guild } = interaction;
        if (!guild) return;
        const db = await database.guilds.fetch(guild.id);

        if (db.selfRoles.length < 1)
            return interaction.reply({
                content: this.setupMessage,
                ephemeral: true
            });

        const channelId = options.getString("sr_channel_name", true);

        const channel = await guild.channels.fetch(channelId);
        if (!channel) return;
        if (!channel.isTextBased()) return;

        const dbChannel = db.selfRoles.find(
            (sr) => sr.channelId === channel.id
        );
        if (!dbChannel) return;

        const message = await interaction.deferReply({
            ephemeral: true,
            fetchReply: true
        });

        const messageId = options.getString("sr_message", true);
        const msg = await channel.messages.fetch(messageId);
        const dbMessage = dbChannel.messages.find((m) => m.id === msg.id);
        if (!dbMessage) return;

        const allButtons = msg.components.flatMap((row) => row.components);

        if (allButtons.length < 1)
            return interaction.editReply({
                content: "There are no buttons to remove!"
            });

        const buttonOptions = allButtons.map((button: any) => ({
            label: button.label,
            value: button.customId
        }));

        const buttonRow = new KRow().setComponents(
            new KStringDropdown()
                .setCustomId("self_roles_buttons")
                .setPlaceholder("Select a button to remove")
                .setOptions(buttonOptions)
                .setMinValues(1)
                .setMaxValues(buttonOptions.length)
        );

        await interaction.editReply({
            content: "Select button(s) to remove",
            components: [buttonRow]
        });

        const btnInteraction = await message.awaitMessageComponent({
            componentType: ComponentType.StringSelect,
            filter: (i) =>
                i.customId === "self_roles_buttons" &&
                i.user.id === interaction.user.id,
            time: 0
        });

        await btnInteraction.deferUpdate();

        for (const buttonId of btnInteraction.values) {
            msg.components.forEach((row: any) => {
                row.components = row.components.filter(
                    (button: any) => button.customId !== buttonId
                );

                if (row.components.length === 0)
                    msg.components = msg.components.filter(
                        (r: any) => r.components.length > 0
                    );
            });

            dbMessage.buttons = dbMessage.buttons.filter(
                (btn) => btn.id !== buttonId
            );
        }

        await msg.edit({
            components: msg.components.length < 1 ? [] : msg.components
        });

        db.markModified("selfroles");
        await db.save();

        return btnInteraction.editReply({
            content: "Removed button(s)",
            components: []
        });
    }
}
