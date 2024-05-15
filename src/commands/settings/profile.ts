import {
    KAttachment,
    KAttachmentOption,
    KEmbed,
    KStringOption
} from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import { ChatInputCommandInteraction } from "discord.js";

import { GetColorName as fromHex } from "hex-color-to-color-name";
import toHex from "colornames";
import { imageToBuffer, validateHex } from "@utils";

@SlashCommand({
    name: "profile",
    description: "Customize your profile card",
    groups: [
        {
            name: "background",
            description: "Change your profile card background",
            subcommands: [
                {
                    name: "banner",
                    description: "Use your banner as your card background"
                },
                {
                    name: "color",
                    description: "Use a color as your card background",
                    options: [
                        new KStringOption()
                            .setName("color")
                            .setDescription(
                                "The color to use as your card background"
                            )
                    ]
                },
                {
                    name: "image",
                    description: "Use an image as your card background",
                    options: [
                        new KAttachmentOption()
                            .setName("background_image")
                            .setDescription(
                                "The image to use as your card background"
                            )
                    ]
                },
                {
                    name: "status",
                    description: "Use your status color as your card background"
                }
            ]
        },
        {
            name: "outlines",
            description: "Change your profile card outlines color",
            subcommands: [
                {
                    name: "avatar",
                    description:
                        "Uses your avatar's colors as your card outlines"
                },
                {
                    name: "banner",
                    description:
                        "Uses your banner's colors as your card outlines"
                },
                {
                    name: "color",
                    description: "Use a color as your card outlines",
                    options: [
                        new KStringOption()
                            .setName("color")
                            .setDescription(
                                "The color to use as your card outlines"
                            )
                    ]
                },
                {
                    name: "status",
                    description: "Use your status color as your card outlines"
                }
            ]
        },
        {
            name: "text",
            description: "Change your profile card text color",
            subcommands: [
                {
                    name: "avatar",
                    description:
                        "Uses your avatar's colors as your card text color"
                },
                {
                    name: "banner",
                    description:
                        "Uses your banner's colors as your card text color"
                },
                {
                    name: "color",
                    description: "Use a color as your card text color",
                    options: [
                        new KStringOption()
                            .setName("color")
                            .setDescription(
                                "The color to use as your card text color"
                            )
                    ]
                },
                {
                    name: "status",
                    description: "Use your status color as your card text color"
                }
            ]
        }
    ]
})
export default class ProfileCommand extends AbstractSlashCommand {
    async slashBackgroundBanner(interaction: ChatInputCommandInteraction) {
        const { user } = interaction;
        const { database } = this.client;

        const db = await database.users.fetch(user.id);

        if (db.card.background.type === "banner")
            return interaction.reply({
                content: "Your card background is already set to your banner",
                ephemeral: true
            });

        db.card.background.type = "banner";

        await db.save();

        interaction.reply({
            content: "Your card background has been set to your banner"
        });
    }

    async slashBackgroundColor(interaction: ChatInputCommandInteraction) {
        const { user, options } = interaction;
        const { database } = this.client;

        const db = await database.users.fetch(user.id);
        const color = options.getString("color");
        db.card.background.type = "color";

        if (!color) {
            await db.save();
            const colorName = fromHex(db.card.background.color);

            return interaction.reply({
                content: `Switched the background to a color, **Current Color**: ${colorName}`,
                ephemeral: true
            });
        }

        let hex: string = color;

        if (!validateHex(color)) hex = toHex(color) ?? "invalid";
        if (hex === "invalid")
            return interaction.reply({
                content: `${color} is not a color`,
                ephemeral: true
            });

        db.card.background.color = hex;

        await db.save();

        interaction.reply({
            content: `Yout card background has been set to **${color}**`,
            ephemeral: true
        });
    }

    async slashBackgroundImage(interaction: ChatInputCommandInteraction) {
        const { user, options } = interaction;
        const { database } = this.client;

        const db = await database.users.fetch(user.id);

        const attachment = options.getAttachment("background_image");

        await interaction.deferReply({
            ephemeral: true
        });

        if (!attachment) {
            if (!db.card.background.image)
                return interaction.editReply({
                    content:
                        "**You don't have any images uploaded as your background before**"
                });

            const newAttachment = new KAttachment(db.card.background.image, {
                name: "current_image.png"
            });

            db.card.background.type = "image";

            await db.save();

            const embed = new KEmbed()
                .setTitle("Your current background image")
                .setImage("attachment://current_image.png");

            return interaction.editReply({
                content: "**Switched the background to an image**",
                embeds: [embed],
                files: [newAttachment]
            });
        }

        if (
            !attachment.contentType?.includes("image") ||
            attachment.contentType === "image/gif"
        )
            return interaction.editReply({
                content: "File has to be an image"
            });

        db.card.background.type = "image";
        db.card.background.image = await imageToBuffer(attachment.url);

        await db.save();

        const embed = new KEmbed()
            .setTitle("Your new background image")
            .setImage(`attachment://${attachment.name}`);

        interaction.editReply({
            content: "Your card background has been set to an image",
            embeds: [embed],
            files: [attachment]
        });
    }

    async slashOutlinesAvatar(interaction: ChatInputCommandInteraction) {
        const user = await interaction.user.fetch();
        if (!user.avatar)
            return interaction.reply({
                content: "You don't have an avatar",
                ephemeral: true
            });

        const { database } = this.client;

        const db = await database.users.fetch(user.id);
        db.card.outlines.type = "avatar";

        await db.save();

        interaction.reply({
            content: "Your card outlines have been set to your avatar's colors"
        });
    }

    async slashOutlinesBanner(interaction: ChatInputCommandInteraction) {
        const user = await interaction.user.fetch();
        if (!user.banner)
            return interaction.reply({
                content: "You don't have a banner",
                ephemeral: true
            });

        const { database } = this.client;

        const db = await database.users.fetch(user.id);
        db.card.outlines.type = "banner";

        await db.save();

        interaction.reply({
            content: "Your card outlines have been set to your banner's colors"
        });
    }

    async slashOutlinesColor(interaction: ChatInputCommandInteraction) {
        const { options } = interaction;

        const user = await interaction.user.fetch();
        const { database } = this.client;

        const db = await database.users.fetch(user.id);

        db.card.outlines.type = "color";

        const color = options.getString("color");
        if (!color) {
            await db.save();
            const colorName = fromHex(db.card.outlines.color);

            return interaction.reply({
                content: `Switched the outlines to a color, **Current Color**: ${colorName}`,
                ephemeral: true
            });
        }

        let hex = color;
        if (!validateHex(color)) hex = toHex(color) ?? "invalid";
        if (hex === "invalid")
            return interaction.reply({
                content: `${color} is not a color`,
                ephemeral: true
            });

        db.card.outlines.color = hex;

        await db.save();

        interaction.reply({
            content: `Your card outlines have been set to **${color}**`,
            ephemeral: true
        });
    }

    async slashOutlinesStatus(interaction: ChatInputCommandInteraction) {
        const { user } = interaction;
        const { database } = this.client;

        const db = await database.users.fetch(user.id);

        db.card.outlines.type = "status";

        await db.save();

        interaction.reply({
            content: "Your card outlines have been set to your status color"
        });
    }

    async slashTextAvatar(interaction: ChatInputCommandInteraction) {
        const user = await interaction.user.fetch();
        if (!user.avatar)
            return interaction.reply({
                content: "You don't have an avatar",
                ephemeral: true
            });

        const { database } = this.client;

        const db = await database.users.fetch(user.id);
        db.card.text.type = "avatar";

        await db.save();

        interaction.reply({
            content: "Your card text color has been set to your avatar's colors"
        });
    }

    async slashTextBanner(interaction: ChatInputCommandInteraction) {
        const user = await interaction.user.fetch();
        if (!user.banner)
            return interaction.reply({
                content: "You don't have a banner",
                ephemeral: true
            });

        const { database } = this.client;

        const db = await database.users.fetch(user.id);
        db.card.text.type = "banner";

        await db.save();

        interaction.reply({
            content: "Your card text color has been set to your banner's colors"
        });
    }

    async slashTextColor(interaction: ChatInputCommandInteraction) {
        const { options } = interaction;

        const user = await interaction.user.fetch();
        const { database } = this.client;

        const db = await database.users.fetch(user.id);

        db.card.text.type = "color";

        const color = options.getString("color");
        if (!color) {
            await db.save();
            const colorName = fromHex(db.card.text.color);

            return interaction.reply({
                content: `Switched the text to a color, **Current Color**: ${colorName}`,
                ephemeral: true
            });
        }

        let hex = color;
        if (!validateHex(color)) hex = toHex(color) ?? "invalid";
        if (hex === "invalid")
            return interaction.reply({
                content: `${color} is not a color`,
                ephemeral: true
            });

        db.card.text.color = hex;

        await db.save();

        interaction.reply({
            content: `Your card text color has been set to **${color}**`,
            ephemeral: true
        });
    }

    async slashTextStatus(interaction: ChatInputCommandInteraction) {
        const { user } = interaction;
        const { database } = this.client;

        const db = await database.users.fetch(user.id);

        db.card.text.type = "status";

        await db.save();

        interaction.reply({
            content: "Your card text color has been set to your status color"
        });
    }
}
