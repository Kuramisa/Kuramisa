import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { Interaction } from "discord.js";

@KEvent({
    event: "interactionCreate",
    description: "Manage self role buttons."
})
export default class SelfRoleButtons extends AbstractKEvent {
    async run(interaction: Interaction) {
        if (!interaction.isButton()) return;
        if (!interaction.inGuild()) return;
        if (!interaction.customId.includes("_sr")) return;
        if (
            !interaction.channelId ||
            !interaction.guildId ||
            !interaction.member
        )
            return;

        const { managers } = this.client;
        const { guildId, channelId, message, user } = interaction;

        const guild = await managers.guilds.get(guildId);

        const dbChannel = guild.selfRoles.find(
            (c) => c.channelId === channelId
        );
        if (!dbChannel)
            return interaction.reply({
                content: "This channel doesn't have self roles.",
                ephemeral: true
            });

        const dbMessage = dbChannel.messages.find((m) => m.id === message.id);
        if (!dbMessage)
            return interaction.reply({
                content: "This message doesn't have self roles.",
                ephemeral: true
            });

        const dbButton = dbMessage.buttons.find(
            (b) => b.id === interaction.customId
        );
        if (!dbButton)
            return interaction.reply({
                content: "This button doesn't have self roles.",
                ephemeral: true
            });

        let member = guild.members.cache.get(user.id);
        if (!member) member = await guild.members.fetch(user.id);
        if (!member) return;

        if (member.roles.cache.has(dbButton.roleId)) {
            await member.roles.remove(dbButton.roleId);
            return interaction.reply({
                content: `Removed role <@&${dbButton.roleId}>`,
                ephemeral: true
            });
        }

        const addedRole = await member.roles
            .add(dbButton.roleId)
            .catch(() => null);

        if (!addedRole)
            return interaction.reply({
                content: "I don't have permission to add roles",
                ephemeral: true
            });

        return interaction.reply({
            content: `Added role <@&${dbButton.roleId}>`,
            ephemeral: true
        });
    }
}
