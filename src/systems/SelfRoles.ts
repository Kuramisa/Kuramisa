import { Modal, ModalRow, TextInput } from "@builders";
import kuramisa from "@kuramisa";
import { ChannelType, ChatInputCommandInteraction } from "discord.js";

export default class SelfRoles {
    async autoSetup(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const { database } = kuramisa;

        const { options, guild } = interaction;

        const db = await database.guilds.fetch(guild.id);

        const channelName = options.getString("channel_name", true);
        const wantsCustomMessage = options.getBoolean("custom_message");

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

        return interaction.reply({
            content: `Self roles have been set up in ${channel}`,
            flags: ["Ephemeral"],
        });
    }
}
