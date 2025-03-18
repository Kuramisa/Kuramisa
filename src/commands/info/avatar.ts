import { Embed, IntegerOption, StringOption, UserOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "classes/SlashCommand";
import {
    ApplicationIntegrationType,
    bold,
    ChatInputCommandInteraction,
    ImageExtension,
    ImageSize,
    InteractionContextType,
} from "discord.js";

@SlashCommand({
    name: "avatar",
    description: "Get the avatar of a user",
    contexts: [
        InteractionContextType.Guild,
        InteractionContextType.BotDM,
        InteractionContextType.PrivateChannel,
    ],
    integrations: [
        ApplicationIntegrationType.GuildInstall,
        ApplicationIntegrationType.UserInstall,
    ],
    options: [
        new UserOption()
            .setName("user")
            .setDescription("The user to get the avatar of"),
        new StringOption()
            .setName("format")
            .setDescription("The image format of the avatar")
            .setChoices(
                {
                    name: "PNG",
                    value: "png",
                },
                {
                    name: "JPG",
                    value: "jpg",
                },
                {
                    name: "WEBP",
                    value: "webp",
                },
                {
                    name: "GIF",
                    value: "gif",
                }
            ),
        new IntegerOption()
            .setName("size")
            .setDescription("The size of the avatar")
            .setChoices(
                {
                    name: "16",
                    value: 16,
                },
                {
                    name: "32",
                    value: 32,
                },
                {
                    name: "64",
                    value: 64,
                },
                {
                    name: "128",
                    value: 128,
                },
                {
                    name: "256",
                    value: 256,
                },
                {
                    name: "512",
                    value: 512,
                },
                {
                    name: "1024",
                    value: 1024,
                },
                {
                    name: "2048",
                    value: 2048,
                },
                {
                    name: "4096",
                    value: 4096,
                }
            ),
    ],
})
export default class AvatarCommand extends AbstractSlashCommand {
    async run(interaction: ChatInputCommandInteraction) {
        const { options } = interaction;

        const user = options.getUser("user") ?? interaction.user;

        const extension: ImageExtension =
            (options.getString("format") as ImageExtension) ?? "png";
        const size: ImageSize =
            (options.getInteger("size") as ImageSize) ?? 128;

        const avatar = user.avatarURL({
            extension,
            size,
        });

        if (!avatar)
            return interaction.reply({
                content: bold("This user has no avatar"),
                flags: "Ephemeral",
            });

        const embed = new Embed()
            .setTitle(`${user.displayName}'s avatar`)
            .setImage(avatar);

        return interaction.reply({ embeds: [embed], flags: ["Ephemeral"] });
    }
}
