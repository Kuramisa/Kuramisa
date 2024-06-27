import { KAttachmentOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import { ChatInputCommandInteraction } from "discord.js";

@SlashCommand({
    name: "greyscale",
    description: "Greyscale an image!",
    options: [
        new KAttachmentOption()
            .setName("image")
            .setDescription("The image to greyscale")
    ]
})
export default class GreyscaleCommand extends AbstractSlashCommand {
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

        const image = await modify.greyscale(img.proxyURL);

        interaction.reply({
            files: [image]
        });
    }
}
