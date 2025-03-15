import kuramisa from "@kuramisa";
import { AbstractEvent, Event } from "classes/Event";
import { bold, Interaction, roleMention } from "discord.js";

@Event({
    event: "interactionCreate",
    description: "Handles the self role buttons",
})
export default class SelfRoleButtonsEvent extends AbstractEvent {
    async run(interaction: Interaction) {
        if (
            !interaction.isButton() ||
            !interaction.inGuild() ||
            !interaction.customId.includes("_sr") ||
            !interaction.inCachedGuild()
        )
            return;

        if (!interaction.guild.members.me?.permissions.has("ManageRoles"))
            return interaction.reply({
                content: bold("I don't have the permission to manage roles"),
                flags: ["Ephemeral"],
            });

        const { managers } = kuramisa;

        const { channelId, guildId, message, member } = interaction;

        const guild = await managers.guilds.get(guildId);

        const dbChannel = guild.selfRoles.find(
            (channel) => channel.channelId === channelId
        );
        if (!dbChannel)
            return interaction.reply({
                content: bold("This button is not in a self role channel"),
                flags: ["Ephemeral"],
            });

        const dbMessage = dbChannel.messages.find(
            (msg) => msg.id === message.id
        );
        if (!dbMessage)
            return interaction.reply({
                content: bold("This button is not in a self role message"),
                flags: ["Ephemeral"],
            });

        const dbButton = dbMessage.buttons.find(
            (btn) => btn.id === interaction.customId
        );
        if (!dbButton)
            return interaction.reply({
                content: bold("This button is not in a self role button"),
                flags: ["Ephemeral"],
            });

        if (member.roles.cache.has(dbButton.roleId)) {
            await member.roles.remove(dbButton.roleId);
            return interaction.reply({
                content: `**Removed role** ${roleMention(dbButton.roleId)}`,
                flags: ["Ephemeral"],
            });
        }

        await member.roles.add(dbButton.roleId);
        return interaction.reply({
            content: `**Added role** ${roleMention(dbButton.roleId)}`,
            flags: ["Ephemeral"],
        });
    }
}
