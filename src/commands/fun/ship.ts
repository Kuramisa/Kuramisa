import { KAttachment, KUserOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import { ChatInputCommandInteraction } from "discord.js";

@SlashCommand({
    name: "ship",
    description: "Ship two people",
    guildOnly: true,
    options: [
        new KUserOption()
            .setName("person_2")
            .setDescription("The second person you want to ship"),
        new KUserOption()
            .setName("person_1")
            .setDescription("The first person you want to ship")
            .setRequired(false)
    ]
})
export default class ShipCommand extends AbstractSlashCommand {
    async run(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const { kanvas } = this.client;
        const { options } = interaction;

        const person1 = options.getMember("person_1") ?? interaction.member;
        const person2 = options.getMember("person_2");
        if (!person1 || !person2)
            return interaction.reply({
                content: "An error occured, try again",
                ephemeral: true
            });

        const ship = await kanvas.images.ship(person1, person2);

        const attachment = new KAttachment(ship, {
            name: `ship-${person1.id}-${person2.id}.png`
        });

        interaction.reply({ files: [attachment] });
    }
}
