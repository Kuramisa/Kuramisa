import { KAttachmentOption, KNumberOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import { ChatInputCommandInteraction } from "discord.js";

@SlashCommand({
    name: "darken",
    description: "Darken someone's profile picture!",
    options: [
        new KAttachmentOption()
            .setName("image")
            .setDescription("The user to darken the picture of")
            .setRequired(true),
        new KNumberOption()
            .setName("intensity")
            .setDescription("The intensity of the darkening effect")
            .setRequired(true)
    ]
})
export default class PingCommand extends AbstractSlashCommand {
    async run(interaction: ChatInputCommandInteraction) {
        const {
            kanvas: { modify }
        } = this.client;

        const { options } = interaction;

        const img = options.getAttachment("image", true);
        if (!img.contentType)
            return interaction.reply({
                content: "The image must be a png, jpg or jpeg file",
                ephemeral: true
            });

        if (!["png", "jpg", "jpeg"].includes(img.contentType.split("/")[1]))
            return interaction.reply({
                content: "The image must be a png, jpg or jpeg file",
                ephemeral: true
            });

        const intensity = options.getNumber("intensity", true);

        const image = await modify.darkness(img.proxyURL, intensity);

        interaction.reply({
            files: [image]
        });
    }
}
