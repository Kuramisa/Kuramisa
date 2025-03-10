import { Modal, ModalRow, TextInput } from "@builders";
import kuramisa from "@kuramisa";
import { ChatInputCommandInteraction, bold } from "discord.js";

export default class SelfRolesMessages {
    async messageAdd(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { database } = kuramisa;
        const { options, guild } = interaction;

        const db = await database.guilds.fetch(guild.id);

        if (db.selfRoles.length === 0)
            return interaction.reply({
                content: bold("No self roles have been set up yet!"),
                flags: ["Ephemeral"],
            });

        const channelId = options.getString("sr_channel_name", true);
        const channel =
            guild.channels.cache.get(channelId) ??
            (await guild.channels.fetch(channelId));

        if (!channel) return;
        if (!channel.isTextBased()) return;

        const dbChannel = db.selfRoles.find(
            (selfRole) => selfRole.channelId === channel.id
        );
        if (!dbChannel) return;

        const wantsCustomMessage = options.getBoolean("custom_message", true);

        if (!wantsCustomMessage) {
            const message = await channel.send({
                content: "Click one of the buttons below to get a role!",
                components: [],
            });

            dbChannel.messages.push({
                id: message.id,
                buttons: [],
            });

            db.markModified("selfRoles");
            await db.save();

            return interaction.reply({
                content: `Added a message to channel ${channel} - ${message}`,
                flags: ["Ephemeral"],
            });
        }

        const modal = new Modal()
            .setCustomId("sr_custom_message_setup")
            .setTitle("Self Roles Custom Message")
            .setComponents(
                new ModalRow().setComponents(
                    new TextInput("long")
                        .setCustomId("sr_custom_message")
                        .setLabel("Custom Message")
                )
            );

        await interaction.showModal(modal);

        const mInteraction = await interaction.awaitModalSubmit({ time: 0 });

        const customMessage =
            mInteraction.fields.getTextInputValue("sr_custom_message");

        const message = await channel.send({
            content: customMessage,
            components: [],
        });

        dbChannel.messages.push({
            id: message.id,
            buttons: [],
        });

        db.markModified("selfRoles");
        await db.save();

        return mInteraction.reply({
            content: `Added a message to channel ${channel} - ${message}`,
            flags: ["Ephemeral"],
        });
    }

    async messageEdit(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { database } = kuramisa;
        const { options, guild } = interaction;

        const db = await database.guilds.fetch(guild.id);

        if (db.selfRoles.length === 0)
            return interaction.reply({
                content: bold("No self roles have been set up yet!"),
                flags: ["Ephemeral"],
            });

        const channelId = options.getString("sr_channel_name", true);
        const channel =
            guild.channels.cache.get(channelId) ??
            (await guild.channels.fetch(channelId));
        if (!channel) return;
        if (!channel.isTextBased()) return;

        const dbChannel = db.selfRoles.find(
            (selfRole) => selfRole.channelId === channel.id
        );
        if (!dbChannel) return;

        const messageId = options.getString("sr_message", true);
        const message =
            channel.messages.cache.get(messageId) ??
            (await channel.messages.fetch(messageId));
        if (!message) return;

        const modal = new Modal()
            .setCustomId("sr_custom_message_setup")
            .setTitle("Editing Self Roles Custom Message")
            .setComponents(
                new ModalRow().setComponents(
                    new TextInput("long")
                        .setCustomId("sr_custom_message")
                        .setLabel("New Custom Message")
                        .setValue(message.content)
                )
            );

        await interaction.showModal(modal);

        const mInteraction = await interaction.awaitModalSubmit({ time: 0 });

        const customMessage =
            mInteraction.fields.getTextInputValue("sr_custom_message");

        await message.edit({
            content: customMessage,
        });

        return mInteraction.reply({
            content: `Edited message ${message}`,
            flags: ["Ephemeral"],
        });
    }

    async messageRemove(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { database } = kuramisa;
        const { options, guild } = interaction;

        const db = await database.guilds.fetch(guild.id);

        if (db.selfRoles.length === 0)
            return interaction.reply({
                content: bold("No self roles have been set up yet!"),
                flags: ["Ephemeral"],
            });

        const channelId = options.getString("sr_channel_name", true);
        const channel =
            guild.channels.cache.get(channelId) ??
            (await guild.channels.fetch(channelId));
        if (!channel) return;
        if (!channel.isTextBased()) return;

        const dbChannel = db.selfRoles.find(
            (selfRole) => selfRole.channelId === channel.id
        );
        if (!dbChannel) return;

        const messageId = options.getString("sr_message", true);
        const message =
            channel.messages.cache.get(messageId) ??
            (await channel.messages.fetch(messageId));
        if (!message) return;

        await message.delete();
        dbChannel.messages = dbChannel.messages.filter(
            (msg) => msg.id !== message.id
        );
        db.markModified("selfRoles");
        await db.save();

        return interaction.reply({
            content: `Removed message ${message.id} - ${message.content} - from channel ${channel}`,
            flags: ["Ephemeral"],
        });
    }
}
