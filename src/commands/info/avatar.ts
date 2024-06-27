import { KEmbed, KNumberOption, KStringOption, KUserOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import {
    ChatInputCommandInteraction,
    ImageExtension,
    ImageSize
} from "discord.js";

@SlashCommand({
    name: "avatar",
    description: "Get the avatar of a user",
    guildOnly: true,
    options: [
        new KUserOption()
            .setName("user")
            .setDescription("The user to get the avatar of"),
        new KStringOption()
            .setName("format")
            .setDescription("The image format of the avatar")
            .setChoices(
                {
                    name: "jpg",
                    value: "jpg"
                },
                {
                    name: "png",
                    value: "png"
                },
                {
                    name: "webp",
                    value: "webp"
                },
                {
                    name: "gif",
                    value: "gif"
                },
                {
                    name: "jpeg",
                    value: "jpeg"
                }
            ),
        new KNumberOption()
            .setName("size")
            .setDescription("The size of the avatar")
            .setChoices(
                {
                    name: "16",
                    value: 16
                },
                {
                    name: "32",
                    value: 32
                },
                {
                    name: "64",
                    value: 64
                },
                {
                    name: "128",
                    value: 128
                },
                {
                    name: "256",
                    value: 256
                },
                {
                    name: "512",
                    value: 512
                },
                {
                    name: "1024",
                    value: 1024
                },
                {
                    name: "2048",
                    value: 2048
                },
                {
                    name: "4096",
                    value: 4096
                }
            )
    ]
})
export default class AvatarCommand extends AbstractSlashCommand {
    async run(interaction: ChatInputCommandInteraction) {
        const { options } = interaction;

        const user = options.getUser("user") ?? interaction.user;

        const format: ImageExtension =
            (options.getString("format") as ImageExtension) ?? "png";

        const size: ImageSize =
            (options.getNumber("size") as ImageSize) ?? 1024;

        const avatar = user.avatarURL({
            extension: format,
            size: size
        });

        if (!avatar)
            return interaction.reply({
                content: "This user does not have an avatar",
                ephemeral: true
            });

        const embed = new KEmbed()
            .setTitle(`${user.globalName ?? user.username}'s avatar`)
            .setImage(avatar);

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
}
