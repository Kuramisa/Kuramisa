import { KAttachmentOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import { ChatInputCommandInteraction } from "discord.js";

@SlashCommand({
    name: "invert-color",
    description: "Invert the color of an image",
    options: [
        new KAttachmentOption()
            .setName("image")
            .setDescription("The image to invert the color of")
    ]
})
export default class InverColorCommand extends AbstractSlashCommand {
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

        const image = await modify.invert(img.proxyURL);

        interaction.reply({
            files: [image]
        });
    }
}
