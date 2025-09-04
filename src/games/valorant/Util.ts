import { Attachment, Button, Row } from "@builders";
import { container } from "@sapphire/pieces";
import type { ValorantSkinInfo } from "@typings/Valorant";
import { transcodeToMp4Stream } from "@utils/Ffmpeg";
import {
    ButtonStyle,
    ComponentType,
    DiscordAPIError,
    type ButtonInteraction,
    type ChatInputCommandInteraction,
    type MessageActionRowComponentBuilder,
    type StringSelectMenuInteraction,
} from "discord.js";
export default class ValorantUtil {
    determineComponents(
        skin: ValorantSkinInfo,
        withNavigation = false,
        chromaPage = 0,
    ) {
        const { kEmojis: emojis } = container.client;

        const components: Row[] = [];

        if (withNavigation) {
            const navRow = new Row().setComponents(
                new Button()
                    .setCustomId("previous_skin")
                    .setEmoji(emojis.get("left_arrow")?.toString() ?? "⬅️")
                    .setStyle(ButtonStyle.Secondary),
                new Button()
                    .setCustomId("next_skin")
                    .setEmoji(emojis.get("right_arrow")?.toString() ?? "➡️")
                    .setStyle(ButtonStyle.Secondary),
            );

            components.push(navRow);
        }

        skin.chroma.components.components.forEach(
            (component: MessageActionRowComponentBuilder, i: number) =>
                i === chromaPage
                    ? component.setDisabled(true)
                    : component.setDisabled(false),
        );

        if (skin.chroma.embeds.length > 1)
            components.push(skin.chroma.components);
        if (skin.level.embeds.length > 1)
            components.push(skin.level.components);

        return components;
    }

    async createSkinCollectors(
        interaction:
            | ChatInputCommandInteraction
            | StringSelectMenuInteraction
            | ButtonInteraction,
        skin: ValorantSkinInfo,
        ephemeral = false,
    ) {
        const message = await interaction
            .reply({
                embeds: [skin.level.embeds[0]],
                components: this.determineComponents(skin),
                withResponse: true,
                flags: ephemeral ? "Ephemeral" : [],
            })
            .then((m) => m.resource?.message);

        if (!message) return;

        const buttonCollector = message.createMessageComponentCollector({
            filter: (i) =>
                i.user.id === interaction.user.id &&
                (i.customId.includes("valorant_skin_chroma") ||
                    i.customId === "add_to_wishlist"),
            componentType: ComponentType.Button,
        });

        const menuCollector = message.createMessageComponentCollector({
            filter: (i) =>
                i.user.id === interaction.user.id &&
                i.customId === "valorant_weapon_skin_level_select",
            componentType: ComponentType.StringSelect,
        });

        let levelPage = 0;

        buttonCollector.on("collect", async (i) => {
            if (i.customId === "add_to_wishlist") {
                await i.reply({
                    content: "**😁 Coming Soon™️!**",
                    flags: "Ephemeral",
                });
                return;
            }

            if (i.customId.includes("valorant_skin_chroma")) {
                const chromaPage = parseInt(i.customId.split("_")[3]);
                if (isNaN(chromaPage)) return;

                await this.updateInfoChroma(i, skin, chromaPage);
                return;
            }

            await this.updateInfoLevel(i, skin, levelPage);
        });

        menuCollector.on("collect", async (i) => {
            levelPage = parseInt(i.values[0]);
            await this.updateInfoLevel(i, skin, levelPage);
        });
    }

    async updateInfoChroma(
        interaction: ButtonInteraction,
        skin: ValorantSkinInfo,
        chromaPage: number,
        withNavigation = false,
    ) {
        const { logger } = container.client;

        const chromaName = skin.chroma.names[chromaPage]
                .replaceAll("\r", "")
                .replaceAll("\n", " "),
            chromaEmbed = skin.chroma.embeds[chromaPage],
            chromaVideo = skin.chroma.videos[chromaPage];

        try {
            if (chromaVideo) {
                await interaction.update({
                    content: `**Loading... \`${chromaName}\`**`,
                    embeds: [],
                    components: [],
                    files: [],
                });

                const chromaStream = transcodeToMp4Stream(
                    chromaVideo,
                    { width: 1280, height: 720, vcodec: "libx264" },
                    (percent) => {
                        const { logger } = container.client;
                        if (!Number.isNaN(percent)) {
                            logger.debug(
                                `[Valorant Skin Video] Processing ${chromaName} video: ${percent}% done`,
                            );
                        }
                    },
                );

                const chromaAttachment = new Attachment(chromaStream).setName(
                    `${chromaName.replaceAll(" ", "_")}.mp4`,
                );

                await interaction.editReply({
                    content: null,
                    embeds: [chromaEmbed],
                    components: this.determineComponents(
                        skin,
                        withNavigation,
                        chromaPage,
                    ),
                    files:
                        skin.chroma.videos.length > 0 ? [chromaAttachment] : [],
                });

                return;
            }

            await interaction.update({
                content: null,
                embeds: [chromaEmbed],
                components: this.determineComponents(
                    skin,
                    withNavigation,
                    chromaPage,
                ),
                files: [],
            });
        } catch (error: unknown) {
            if (error instanceof DiscordAPIError) {
                if (error.code !== 40005) {
                    logger.error(error.message, { error });
                    return;
                }
            }

            await interaction
                .update({
                    content: `**Link to the preview** -> ${chromaVideo}`,
                    embeds: [chromaEmbed],
                    components: this.determineComponents(
                        skin,
                        withNavigation,
                        chromaPage,
                    ),
                    files: [],
                })
                .catch(async () => {
                    await interaction.editReply({
                        content: `**Link to the preview** *(since the video file size was too large to display)* -> ${chromaVideo}`,
                        embeds: [chromaEmbed],
                        components: this.determineComponents(
                            skin,
                            withNavigation,
                            chromaPage,
                        ),
                        files: [],
                    });
                });
        }
    }

    async updateInfoLevel(
        interaction: ButtonInteraction | StringSelectMenuInteraction,
        skin: ValorantSkinInfo,
        levelPage: number,
        withNavigation = false,
    ) {
        const { logger } = container.client;

        const skinName = skin.level.names[levelPage]
                .replaceAll("\r", "")
                .replaceAll("\n", " "),
            skinEmbed = skin.level.embeds[levelPage],
            skinVideo = skin.level.videos[levelPage];

        try {
            if (skinVideo) {
                await interaction.update({
                    content: `**Loading... \`${skinName}\`**`,
                    embeds: [],
                    components: [],
                    files: [],
                });

                const skinStream = transcodeToMp4Stream(
                    skinVideo,
                    { width: 1280, height: 720, vcodec: "libx264" },
                    (percent) => {
                        const { logger } = container.client;
                        logger.debug(
                            `[Valorant Skin Video] Processing ${skinName} video: ${percent}% done`,
                        );
                    },
                );

                const skinAttachment = new Attachment(skinStream).setName(
                    `${skinName.replaceAll(" ", "_")}.mp4`,
                );

                await interaction.editReply({
                    content: null,
                    embeds: [skinEmbed],
                    components: this.determineComponents(skin, withNavigation),
                    files: skin.level.videos.length > 0 ? [skinAttachment] : [],
                });

                return;
            }

            await interaction.update({
                content: null,
                embeds: [skinEmbed],
                components: this.determineComponents(skin, withNavigation),
                files: [],
            });
        } catch (error: unknown) {
            if (error instanceof DiscordAPIError) {
                if (error.code !== 40005) {
                    logger.error(error.message, { error });
                    return;
                }
            }

            await interaction
                .update({
                    content: `**Link to the preview** *(since the video file size was too large to display)* -> ${skinVideo}`,
                    embeds: [skinEmbed],
                    components: this.determineComponents(skin, withNavigation),
                    files: [],
                })
                .catch(async () => {
                    await interaction.editReply({
                        content: `**Link to the preview** *(since the video file size was too large to display)* -> ${skinVideo}`,
                        embeds: [skinEmbed],
                        components: this.determineComponents(
                            skin,
                            withNavigation,
                        ),
                        files: [],
                    });
                });
        }
    }
}
