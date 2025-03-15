import { Button, Row } from "@builders";
import kuramisa from "@kuramisa";
import { bold, ChatInputCommandInteraction, ComponentType } from "discord.js";
import logger from "Logger";

export default class SelfRolesButtons {
    async buttonAdd(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { managers } = kuramisa;
        const { options, guild } = interaction;

        const db = await managers.guilds.get(guild.id);

        if (db.selfRoles.length === 0)
            return interaction.reply({
                content: bold("You do not have self roles setup"),
                flags: ["Ephemeral"],
            });

        await interaction.deferReply({
            flags: ["Ephemeral"],
        });

        const channelId = options.getString("sr_channel", true);
        const channel =
            guild.channels.cache.get(channelId) ??
            (await guild.channels.fetch(channelId).catch(() => null));

        if (!channel)
            return interaction.editReply({
                content: bold("This channel does not exist"),
            });
        if (!channel.isTextBased())
            return interaction.editReply({
                content: bold(
                    "The channel is not a text channel, somehow? Are you sure you setup the channel correctly? :3"
                ),
            });

        const dbChannel = db.selfRoles.find(
            (sr) => sr.channelId === channel.id
        );
        if (!dbChannel)
            return interaction.editReply({
                content: bold("This channel is not a self role channel"),
            });

        const messageId = options.getString("sr_message", true);
        const message =
            channel.messages.cache.get(messageId) ??
            (await channel.messages.fetch(messageId).catch(() => null));
        if (!message)
            return interaction.editReply({
                content: bold("This message does not exist"),
            });

        let buttonCount = 0;
        for (const component of message.components) {
            for (const button of component.components) {
                if (button.type === ComponentType.Button) {
                    buttonCount++;
                }
            }
        }

        if (buttonCount === 25)
            return interaction.editReply({
                content: bold(
                    "You have reached the maximum amount of buttons for this message (25)"
                ),
            });

        const role = options.getRole("sr_button_role", true);
        const buttonName = options.getString("sr_button_name", true);
        const buttonStyle = options.getNumber("sr_button_style", true);
        const buttonEmoji = options.getString("sr_button_emoji");
        const buttonId = buttonName
            .toLowerCase()
            .split(" ")
            .join("_")
            .concat("_sr");

        const dbMessage = dbChannel.messages.find((sr) => sr.id === message.id);

        if (!dbMessage)
            return interaction.editReply({
                content: bold("This message does not exist in the database"),
            });

        const button = new Button()
            .setCustomId(buttonId)
            .setLabel(buttonName)
            .setStyle(buttonStyle);

        if (buttonEmoji) button.setEmoji(buttonEmoji);

        try {
            const latestRow = message.components.at(-1);
            if (!latestRow) {
                const row = new Row().addComponents(button);
                message.components.push(row as any);

                await message.edit({
                    components: message.components,
                });

                dbMessage.buttons.push({
                    id: buttonId,
                    name: buttonName,
                    roleId: role.id,
                    emoji: buttonEmoji,
                    style: buttonStyle,
                });

                db.markModified("selfRoles");
                await db.save();

                return interaction.editReply({
                    content: `Added button ${buttonName} to ${message}`,
                });
            }

            if (latestRow.components.length === 5) {
                const newRow = new Row().addComponents(button);
                message.components.push(newRow as any);
            }

            if (latestRow.components.length < 5) {
                latestRow.components.push(button as any);
            }

            await message.edit({
                components: message.components,
            });

            dbMessage.buttons.push({
                id: buttonId,
                name: buttonName,
                roleId: role.id,
                emoji: buttonEmoji,
                style: buttonStyle,
            });

            db.markModified("selfRoles");
            await db.save();

            return interaction.editReply({
                content: `Added button **${buttonName}** to ${message}`,
            });
        } catch (err: any) {
            logger.error(err.message, { err });

            if (err.message.includes("duplicated"))
                return interaction.editReply({
                    content: bold("This button already exists!"),
                });

            return interaction.editReply({
                content: bold("Something went wrong! Please try again."),
            });
        }
    }

    async buttonEdit(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { managers } = kuramisa;
        const { options, guild } = interaction;

        const newButtonRole = options.getRole("sr_button_role");
        const newButtonName = options.getString("sr_button_name");
        const newButtonStyle = options.getNumber("sr_button_style");
        const newButtonEmoji = options.getString("sr_button_emoji");

        if (
            !newButtonRole &&
            !newButtonName &&
            !newButtonStyle &&
            !newButtonEmoji
        )
            return interaction.reply({
                content: bold("You must provide at least one option to edit"),
                flags: ["Ephemeral"],
            });

        const db = await managers.guilds.get(guild.id);

        if (db.selfRoles.length === 0)
            return interaction.reply({
                content: bold("No self roles have been set up yet!"),
                flags: ["Ephemeral"],
            });

        const channelId = options.getString("sr_channel", true);
        const channel =
            guild.channels.cache.get(channelId) ??
            (await guild.channels.fetch(channelId).catch(() => null));
        if (!channel)
            return interaction.reply({
                content: bold("This channel does not exist"),
                flags: ["Ephemeral"],
            });
        if (!channel.isTextBased())
            return interaction.reply({
                content: bold(
                    "The channel is not a text channel, somehow? Are you sure you setup the channel correctly? :3"
                ),
                flags: ["Ephemeral"],
            });

        const dbChannel = db.selfRoles.find(
            (sr) => sr.channelId === channel.id
        );
        if (!dbChannel)
            return interaction.reply({
                content: bold("This channel is not a self role channel"),
                flags: ["Ephemeral"],
            });

        const messageId = options.getString("sr_message", true);
        const message =
            channel.messages.cache.get(messageId) ??
            (await channel.messages.fetch(messageId).catch(() => null));
        if (!message)
            return interaction.reply({
                content: bold("This message does not exist"),
                flags: ["Ephemeral"],
            });

        const dbMessage = dbChannel.messages.find((sr) => sr.id === message.id);
        if (!dbMessage)
            return interaction.reply({
                content: bold("This message does not exist in the database"),
                flags: ["Ephemeral"],
            });

        const buttonName = options.getString("sr_button", true);
        const dbButton = dbMessage.buttons.find(
            (sr) =>
                sr.id.toLowerCase() === buttonName.toLowerCase() ||
                sr.name.toLowerCase() === buttonName.toLowerCase()
        );

        if (!dbButton)
            return interaction.reply({
                content: bold("This button does not exist in the database"),
                flags: ["Ephemeral"],
            });

        const button = new Button();

        if (newButtonRole) dbButton.roleId = newButtonRole.id;
        if (newButtonName) {
            dbButton.name = newButtonName;
            const id = newButtonName
                .toLowerCase()
                .split(" ")
                .join("_")
                .concat("_sr");

            button.setCustomId(id);
            button.setLabel(newButtonName);
        }
        if (newButtonStyle) {
            dbButton.style = newButtonStyle;
            button.setStyle(newButtonStyle);
        }
        if (newButtonEmoji) {
            dbButton.emoji = newButtonEmoji;
            button.setEmoji(newButtonEmoji);
        }

        message.components = message.components.map((row: any) => {
            const newRow = row.components.map((component: any) => {
                if (component.type === ComponentType.Button) {
                    if (component.customId === dbButton.id) {
                        return button;
                    }
                }
                return component;
            });

            return newRow;
        });

        db.markModified("selfRoles");
        await db.save();

        return interaction.reply({
            content: `Edited button **${buttonName}** on ${message}`,
            flags: ["Ephemeral"],
        });
    }

    async buttonRemove(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { managers } = kuramisa;
        const { options, guild } = interaction;

        const db = await managers.guilds.get(guild.id);

        if (db.selfRoles.length === 0)
            return interaction.reply({
                content: bold("You do not have self roles setup"),
                flags: ["Ephemeral"],
            });

        const channelId = options.getString("sr_channel", true);
        const channel =
            guild.channels.cache.get(channelId) ??
            (await guild.channels.fetch(channelId).catch(() => null));
        if (!channel)
            return interaction.reply({
                content: bold("This channel does not exist"),
                flags: ["Ephemeral"],
            });
        if (!channel.isTextBased())
            return interaction.reply({
                content: bold(
                    "The channel is not a text channel, somehow? Are you sure you setup the channel correctly? :3"
                ),
                flags: ["Ephemeral"],
            });

        const dbChannel = db.selfRoles.find(
            (sr) => sr.channelId === channel.id
        );
        if (!dbChannel)
            return interaction.reply({
                content: bold("This channel is not a self role channel"),
                flags: ["Ephemeral"],
            });

        const messageId = options.getString("sr_message", true);
        const message =
            channel.messages.cache.get(messageId) ??
            (await channel.messages.fetch(messageId).catch(() => null));
        if (!message)
            return interaction.reply({
                content: bold("This message does not exist"),
                flags: ["Ephemeral"],
            });

        const dbMessage = dbChannel.messages.find((sr) => sr.id === message.id);
        if (!dbMessage)
            return interaction.reply({
                content: bold("This message does not exist in the database"),
                flags: ["Ephemeral"],
            });

        const buttonName = options.getString("sr_button", true);
        const dbButton = dbMessage.buttons.find(
            (sr) =>
                sr.id.toLowerCase() === buttonName.toLowerCase() ||
                sr.name.toLowerCase() === buttonName.toLowerCase()
        );
        if (!dbButton)
            return interaction.reply({
                content: bold("This button does not exist in the database"),
                flags: ["Ephemeral"],
            });

        dbMessage.buttons = dbMessage.buttons.filter(
            (sr) => sr.id !== dbButton.id
        );
        dbMessage.buttons = dbMessage.buttons.filter(
            (sr) => sr.name !== dbButton.name
        );

        message.components = message.components.filter((row) => {
            const newRow = row.components.filter((component) => {
                if (component.type === ComponentType.Button) {
                    return component.customId !== dbButton.id;
                }
                return true;
            });

            return newRow.length > 0;
        });

        await message.edit({
            components: message.components,
        });

        db.markModified("selfRoles");

        await db.save();

        return interaction.reply({
            content: `Removed button **${buttonName}** from ${message}`,
            flags: ["Ephemeral"],
        });
    }
}
