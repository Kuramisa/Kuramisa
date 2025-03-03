import { Modal, ModalRow, TextInput } from "@builders";
import kuramisa from "@kuramisa";
import {
    bold,
    channelLink,
    ChannelType,
    ChatInputCommandInteraction,
    messageLink,
} from "discord.js";

export default class SelfRoles {
    async autoSetup(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const { database } = kuramisa;
        const { options, guild } = interaction;

        const db = await database.guilds.fetch(guild.id);

        const channelName = options.getString("channel_name", true);
        const wantsCustomMessage = options.getBoolean("custom_message", true);

        const channel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: guild.members.me?.id ?? kuramisa.user?.id ?? "",
                    allow: ["ViewChannel", "SendMessages", "ManageMessages"],
                },
            ],
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
                content: `Self roles have been set up in ${channel}`,
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
            content: `Self roles have been set up in ${channel}`,
            flags: ["Ephemeral"],
        });
    }

    async viewSetups(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const { database } = kuramisa;
        const { guild } = interaction;

        const db = await database.guilds.fetch(guild.id);

        const { selfRoles } = db;

        if (selfRoles.length === 0)
            return interaction.reply({
                content: bold("No self roles have been set up yet!"),
                flags: ["Ephemeral"],
            });

        const setups = [];

        for (const roles of selfRoles) {
            const channel =
                guild.channels.cache.get(roles.channelId) ??
                (await guild.channels.fetch(roles.channelId));

            if (!channel) continue;
            if (!channel.isTextBased()) return;

            const messages = [];
            for (const message of roles.messages) {
                const msg =
                    channel.messages.cache.get(message.id) ??
                    (await channel.messages.fetch(message.id));

                if (!msg) continue;

                messages.push(
                    `${bold(
                        messageLink(channel.id, message.id, guild.id)
                    )} - ${message.buttons.length} buttons`
                );
            }

            setups.push(
                `${bold(channelLink(channel.id, guild.id))} - ${messages.join(
                    "\n"
                )}`
            );
        }

        return interaction.reply({
            content: `${bold("Self roles setups")}\n\n${setups.join("\n")}`,
            flags: ["Ephemeral"],
        });
    }

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
}
