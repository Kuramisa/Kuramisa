import { Modal, ModalRow, TextInput } from "@builders";

import { ChatInputCommandInteraction, bold, messageLink } from "discord.js";

export default class SelfRolesMessages {
    async messageAdd(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { managers } = kuramisa;
        const { options, guild } = interaction;

        const db = await managers.guilds.get(guild.id);

        if (db.selfRoles.length === 0)
            return interaction.reply({
                content: bold("No self roles have been set up yet!"),
                flags: "Ephemeral",
            });

        const channelId = options.getString("sr_channel", true);
        const channel =
            guild.channels.cache.get(channelId) ??
            (await guild.channels.fetch(channelId).catch(() => null));

        if (!channel)
            return interaction.reply({
                content: bold("This channel does not exist"),
                flags: "Ephemeral",
            });
        if (!channel.isTextBased())
            return interaction.reply({
                content: bold(
                    "The channel is not a text channel, somehow? Are you sure you setup the channel correctly? :3"
                ),
                flags: "Ephemeral",
            });

        const dbChannel = db.selfRoles.find(
            (selfRole) => selfRole.channelId === channel.id
        );
        if (!dbChannel)
            return interaction.reply({
                content: bold("This channel is not a self role channel"),
                flags: "Ephemeral",
            });

        const wantsCustomMessage = options.getBoolean("custom_message", true);

        if (!wantsCustomMessage) {
            const message = await channel.send({
                content: bold("Click one of the buttons below to get a role!"),
                components: [],
            });

            dbChannel.messages.push({
                id: message.id,
                buttons: [],
            });

            db.markModified("selfRoles");
            await db.save();

            return interaction.reply({
                content: `**Added a message to channel ${channel} - ${messageLink(channel.id, message.id, guild.id)}**`,
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
            content: `**Added a message to channel ${channel} - ${messageLink(channel.id, message.id, guild.id)}**`,
            flags: "Ephemeral",
        });
    }

    async messageEdit(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { managers } = kuramisa;
        const { options, guild } = interaction;

        const db = await managers.guilds.get(guild.id);

        if (db.selfRoles.length === 0)
            return interaction.reply({
                content: bold("No self roles have been set up yet!"),
                flags: "Ephemeral",
            });

        const channelId = options.getString("sr_channel", true);
        const channel =
            guild.channels.cache.get(channelId) ??
            (await guild.channels.fetch(channelId).catch(() => null));
        if (!channel)
            return interaction.reply({
                content: bold("This channel does not exist"),
                flags: "Ephemeral",
            });
        if (!channel.isTextBased())
            return interaction.reply({
                content: bold(
                    "The channel is not a text channel, somehow? Are you sure you setup the channel correctly? :3"
                ),
                flags: "Ephemeral",
            });

        const dbChannel = db.selfRoles.find(
            (selfRole) => selfRole.channelId === channel.id
        );
        if (!dbChannel)
            return interaction.reply({
                content: bold("This channel is not a self role channel"),
                flags: "Ephemeral",
            });

        const messageId = options.getString("sr_message", true);
        const message =
            channel.messages.cache.get(messageId) ??
            (await channel.messages.fetch(messageId).catch(() => null));
        if (!message)
            return interaction.reply({
                content: bold("This message does not exist"),
                flags: "Ephemeral",
            });

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
            content: `**Edited message ${message} - ${channel}**`,
            flags: "Ephemeral",
        });
    }

    async messageRemove(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { managers } = kuramisa;
        const { options, guild } = interaction;

        const db = await managers.guilds.get(guild.id);

        if (db.selfRoles.length === 0)
            return interaction.reply({
                content: bold("No self roles have been set up yet!"),
                flags: "Ephemeral",
            });

        const channelId = options.getString("sr_channel", true);
        const channel =
            guild.channels.cache.get(channelId) ??
            (await guild.channels.fetch(channelId).catch(() => null));
        if (!channel)
            return interaction.reply({
                content: bold("This channel does not exist"),
                flags: "Ephemeral",
            });
        if (!channel.isTextBased())
            return interaction.reply({
                content: bold(
                    "The channel is not a text channel, somehow? Are you sure you setup the channel correctly? :3"
                ),
                flags: "Ephemeral",
            });

        const dbChannel = db.selfRoles.find(
            (selfRole) => selfRole.channelId === channel.id
        );
        if (!dbChannel)
            return interaction.reply({
                content: bold("This channel is not a self role channel"),
                flags: "Ephemeral",
            });

        const messageId = options.getString("sr_message", true);
        const message =
            channel.messages.cache.get(messageId) ??
            (await channel.messages.fetch(messageId).catch(() => null));
        if (!message)
            return interaction.reply({
                content: bold("This message does not exist"),
                flags: "Ephemeral",
            });

        await message.delete();
        dbChannel.messages = dbChannel.messages.filter(
            (msg) => msg.id !== message.id
        );
        db.markModified("selfRoles");
        await db.save();

        return interaction.reply({
            content: `**Removed a message**\n\n\`ID\` - ${message.id}\n\`Description\` - ${message.content}\n\`From\` - ${channel}`,
            flags: "Ephemeral",
        });
    }
}
