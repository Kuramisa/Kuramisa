import { Button, Row } from "@builders";
import kuramisa from "@kuramisa";
import { bold, ChatInputCommandInteraction, ComponentType } from "discord.js";
import logger from "Logger";

export default class SelfRolesButtons {
    async buttonAdd(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { database } = kuramisa;
        const { options, guild } = interaction;

        const db = await database.guilds.fetch(guild.id);

        if (db.selfRoles.length === 0)
            return interaction.reply({
                content: bold("You do not have self roles setup"),
                flags: ["Ephemeral"],
            });

        await interaction.deferReply({
            flags: ["Ephemeral"],
        });

        const channelId = options.getString("sr_channel_name", true);
        const channel =
            guild.channels.cache.get(channelId) ??
            (await guild.channels.fetch(channelId));

        if (!channel) return;
        if (!channel.isTextBased()) return;

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
            (await channel.messages.fetch(messageId));
        if (!message) return;

        let buttonCount = 0;
        for (const component of message.components) {
            if (component.type === ComponentType.ActionRow) {
                for (const button of component.components) {
                    if (button.type === ComponentType.Button) {
                        buttonCount++;
                    }
                }
            }
        }

        if (buttonCount === 25)
            return interaction.reply({
                content:
                    "You have reached the maximum amount of buttons for this message (25)",
                flags: ["Ephemeral"],
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

        if (!dbMessage) return;

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
                content: `Added button ${buttonName} to ${message}`,
            });
        } catch (err: any) {
            logger.error(err.message, { err });

            if (err.message.includes("duplicated"))
                return interaction.editReply({
                    content: "This button already exists!",
                });

            return interaction.editReply({
                content: "Something went wrong! Please try again.",
            });
        }
    }
}
