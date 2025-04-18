import type { Args } from "@sapphire/framework";
import { Embed, IntegerOption, StringOption, UserOption } from "Builders";
import { AbstractSlashCommand, SlashCommand } from "classes/SlashCommand";
import type {
    ChatInputCommandInteraction,
    ImageExtension,
    ImageSize,
    Message,
} from "discord.js";
import {
    ApplicationIntegrationType,
    InteractionContextType,
    bold,
} from "discord.js";

@SlashCommand({
    name: "avatar",
    aliases: ["pfp"],
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
    opts: [
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
                },
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
                },
            ),
    ],
})
export default class AvatarCommand extends AbstractSlashCommand {
    async messageRun(message: Message, args: Args) {
        const user = await args.pick("user").catch(() => message.author);
        const extension = (await args
            .pick("enum", {
                name: "format",
                choices: ["png", "jpg", "webp", "gif"],
            })
            .catch(() => "png")) as ImageExtension;
        const size = (await args
            .pick("enum", {
                name: "size",
                choices: [16, 32, 64, 128, 256, 512, 1024, 2048, 4096],
            })
            .then(parseInt)
            .catch(() => 1024)) as ImageSize;

        const avatar = user.avatarURL({
            extension,
            size,
        });

        if (!avatar)
            return message.reply({
                content: bold("This user has no avatar"),
            });

        const embed = new Embed()
            .setTitle(`${user.displayName}'s avatar`)
            .setImage(avatar);

        return message.reply({ embeds: [embed] });
    }

    async chatInputRun(interaction: ChatInputCommandInteraction) {
        const { options } = interaction;

        const user = options.getUser("user") ?? interaction.user;

        const extension = options.getString("format", true) as ImageExtension;
        const size = options.getInteger("size", true) as ImageSize;

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

        return interaction.reply({ embeds: [embed], flags: "Ephemeral" });
    }
}
