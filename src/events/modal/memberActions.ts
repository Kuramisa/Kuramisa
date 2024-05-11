import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { Interaction } from "discord.js";

@KEvent({
    event: "interactionCreate",
    description: "Modal actions frokm member buttons"
})
export default class Event extends AbstractKEvent {
    async run(interaction: Interaction) {
        if (!interaction.isModalSubmit()) return;

        const id = interaction.customId.split("_")[2];

        if (![`warn_member_${id}`].includes(interaction.customId)) return;

        if (!interaction.guild || !interaction.member) return;

        const { moderation } = this.client;

        const { fields, guild } = interaction;

        const target = await guild.members.fetch(id).catch(() => null);

        if (!target)
            return interaction.reply({
                content: "**Member not found**",
                ephemeral: true
            });

        if (interaction.customId === `warn_member_${id}`)
            return moderation.warns.create(
                guild,
                target,
                interaction.member,
                fields.getTextInputValue("warn_reason")
            );
    }
}
