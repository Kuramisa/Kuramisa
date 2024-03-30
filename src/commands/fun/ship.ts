import { Command } from "@sapphire/framework";
import { AttachmentBuilder } from "discord.js";

export class ShipCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "ship",
            description: "Ship two people"
        });
    }

    override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addUserOption((option) =>
                    option
                        .setName("person_2")
                        .setDescription("The second person")
                        .setRequired(true)
                )
                .addUserOption((option) =>
                    option
                        .setName("person_1")
                        .setDescription("The first person")
                        .setRequired(false)
                )
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;
        const { kanvas } = this.container;
        const { options } = interaction;

        const person1 = options.getMember("person_1") ?? interaction.member;
        const person2 = options.getMember("person_2");
        if (!person1 || !person2)
            return interaction.reply({
                content: "An error occured, try again",
                ephemeral: true
            });

        const ship = await kanvas.images.ship(person1, person2);

        const attachment = new AttachmentBuilder(ship, {
            name: `ship-${person1.id}-${person2.id}.png`
        });

        return interaction.reply({ files: [attachment] });
    }
}
