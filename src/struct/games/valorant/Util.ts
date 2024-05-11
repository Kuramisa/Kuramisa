import kuramisa from "@kuramisa";
import type Valorant from "./";
import {
    type ActionRowBuilder,
    AttachmentBuilder,
    type ButtonInteraction,
    ButtonStyle,
    type ChatInputCommandInteraction,
    ComponentType,
    type MessageActionRowComponentBuilder,
    type StringSelectMenuInteraction,
    type User
} from "discord.js";
import ffmpeg from "fluent-ffmpeg";
import { type Store } from "@valapi/web-client";
import { type Weapons } from "@valapi/valorant-api.com";
import { capitalize, startCase } from "lodash";
import { KButton, KEmbed, KRow, randEl } from "@utils";

export default class ValorantUtil {
    readonly valorant: Valorant;

    constructor(valorant: Valorant) {
        this.valorant = valorant;
    }

    determineComponents(
        skin: ValorantSkin,
        withNavigation = false,
        chromaPage = 0
    ) {
        const components: ActionRowBuilder<MessageActionRowComponentBuilder>[] =
            [];

        if (withNavigation) {
            const navRow = new KRow().setComponents(
                new KButton()
                    .setCustomId("previous_skin")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("◀️"),
                new KButton()
                    .setCustomId("next_skin")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("▶️")
            );

            components.push(navRow);
        }

        skin.chroma.components.components.map((component: any, i: number) =>
            i === chromaPage
                ? component.setDisabled(true)
                : component.setDisabled(false)
        );

        if (skin.chroma.embeds.length > 1)
            components.push(skin.chroma.components);
        if (skin.level.embeds.length > 1)
            components.push(skin.level.components);
        components.push(
            new KRow().setComponents(
                new KButton()
                    .setCustomId("add_to_wishlist")
                    .setLabel("Add to Wishlist")
                    .setStyle(ButtonStyle.Success)
            )
        );

        return components;
    }

    async createSkinCollectors(
        interaction:
            | ChatInputCommandInteraction
            | StringSelectMenuInteraction
            | ButtonInteraction,
        skin: ValorantSkin,
        ephemeral = false
    ) {
        const message = await interaction.reply({
            embeds: [skin.level.embeds[0]],
            components: this.determineComponents(skin),
            fetchReply: true,
            ephemeral
        });

        const buttonCollector = message.createMessageComponentCollector({
            filter: (i) =>
                i.user.id === interaction.user.id &&
                (i.customId.includes("valorant_skin_chroma") ||
                    i.customId === "add_to_wishlist"),
            componentType: ComponentType.Button
        });

        const menuCollector = message.createMessageComponentCollector({
            filter: (i) =>
                i.user.id === interaction.user.id &&
                i.customId === "valorant_weapon_skin_level_select",
            componentType: ComponentType.StringSelect
        });

        let levelPage = 0;

        buttonCollector.on("collect", async (i) => {
            if (i.customId === "add_to_wishlist") {
                await i.reply({
                    content: "**😁 Coming Soon™️!**",
                    ephemeral: true
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
        skin: ValorantSkin,
        chromaPage: number,
        withNavigation = false
    ) {
        const { logger } = kuramisa;

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
                    files: []
                });

                const chromaStream = ffmpeg(chromaVideo)
                    .videoCodec("libx264")
                    .format("mp4")
                    .size("1280x720")
                    .on("error", (err, stdout, stderr) => {
                        logger.error(err);
                        logger.error(stdout);
                        logger.error(stderr);
                    })
                    .on("progress", async (progress) => {
                        const percent = Math.round(progress.percent);
                        logger.debug(
                            `Processing ${chromaName} video: ${percent}% done`
                        );
                        if (percent === 100) {
                            await interaction.editReply({
                                content: `**Loading... \`${chromaName}\` - Complete**`,
                                embeds: [],
                                components: []
                            });

                            return;
                        }

                        // Keep this commented out for now, since it's a bit spammy to discord api
                        await interaction.editReply({
                            content: `**Loading... \`${chromaName}\` - ${percent}% done**`,
                            embeds: [],
                            components: [],
                            files: []
                        });
                    })
                    .on("end", () => {
                        logger.debug(`Finished processing ${chromaName} video`);
                    })
                    .outputOptions("-movflags frag_keyframe+empty_moov")
                    .pipe();

                const chromaAttachment = new AttachmentBuilder(
                    chromaStream
                ).setName(`${chromaName.replaceAll(" ", "_")}.mp4`);

                await interaction.editReply({
                    content: null,
                    embeds: [chromaEmbed],
                    components: this.determineComponents(
                        skin,
                        withNavigation,
                        chromaPage
                    ),
                    files:
                        skin.chroma.videos.length > 0 ? [chromaAttachment] : []
                });

                return;
            }

            await interaction.update({
                content: null,
                embeds: [chromaEmbed],
                components: this.determineComponents(
                    skin,
                    withNavigation,
                    chromaPage
                ),
                files: []
            });
        } catch (err: any) {
            if (err.code !== 40005) {
                logger.error(err);
                return;
            }

            await interaction
                .update({
                    content: `**Link to the preview** -> ${chromaVideo}`,
                    embeds: [chromaEmbed],
                    components: this.determineComponents(
                        skin,
                        withNavigation,
                        chromaPage
                    ),
                    files: []
                })
                .catch(() => {
                    interaction.editReply({
                        content: `**Link to the preview** *(since the video file size was too large to display)* -> ${chromaVideo}`,
                        embeds: [chromaEmbed],
                        components: this.determineComponents(
                            skin,
                            withNavigation,
                            chromaPage
                        ),
                        files: []
                    });
                });
        }
    }

    async updateInfoLevel(
        interaction: ButtonInteraction | StringSelectMenuInteraction,
        skin: ValorantSkin,
        levelPage: number,
        withNavigation = false
    ) {
        const { logger } = kuramisa;

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
                    files: []
                });

                const skinStream = ffmpeg(skinVideo)
                    .videoCodec("libx264")
                    .format("mp4")
                    .size("1280x720")
                    .on("error", (err, stdout, stderr) => {
                        logger.error(err);
                        logger.error(stdout);
                        logger.error(stderr);
                    })
                    .on("progress", async (progress) => {
                        const percent = Math.round(progress.percent);
                        logger.debug(
                            `Processing ${skinName} video: ${percent}% done`
                        );
                        // Keep this commented out for now, since it's a bit spammy to discord api
                        if (percent === 100) {
                            await interaction.editReply({
                                content: `**Loading... \`${skinName}\` - Complete**`,
                                embeds: [],
                                components: []
                            });

                            return;
                        }

                        await interaction.editReply({
                            content: `**Loading... \`${skinName}\` - ${percent}% done**`,
                            embeds: [],
                            components: [],
                            files: []
                        });
                    })
                    .on("end", () => {
                        logger.debug(`Finished processing ${skinName} video`);
                    })
                    .outputOptions("-movflags frag_keyframe+empty_moov")
                    .pipe();

                const skinAttachment = new AttachmentBuilder(
                    skinStream
                ).setName(`${skinName.replaceAll(" ", "_")}.mp4`);

                await interaction.editReply({
                    content: null,
                    embeds: [skinEmbed],
                    components: this.determineComponents(skin, withNavigation),
                    files: skin.level.videos.length > 0 ? [skinAttachment] : []
                });

                return;
            }

            await interaction.update({
                content: null,
                embeds: [skinEmbed],
                components: this.determineComponents(skin, withNavigation),
                files: []
            });
        } catch (err: any) {
            if (err.code !== 40005) {
                logger.error(err);
                return;
            }

            await interaction
                .update({
                    content: `**Link to the preview** -> ${skinVideo}`,
                    embeds: [skinEmbed],
                    components: this.determineComponents(skin, withNavigation),
                    files: []
                })
                .catch(() => {
                    interaction.editReply({
                        content: `**Link to the preview** *(since the video file size was too large to display)* -> ${skinVideo}`,
                        embeds: [skinEmbed],
                        components: this.determineComponents(
                            skin,
                            withNavigation
                        ),
                        files: []
                    });
                });
        }
    }

    async shopCard(
        account: IValorantAccount,
        shopType: "daily" | "featured" | "night" | "accessory",
        time: number,
        privacytype: PrivacyTypes
    ) {
        const {
            data: { Identity: identity }
        } = await account.auth.Personalization.getPlayerLoadout(
            account.player.sub
        );

        const { valorant } = this;
        const { playerCards, playerTitles } = valorant;
        const { kanvas } = kuramisa;

        const card = playerCards.getByID(identity.PlayerCardID);
        const title = playerTitles.getByID(identity.PlayerTitleID);

        const colors = (await kanvas.popularColor(card?.wideArt ?? null)) ?? [];
        const color = colors.length > 0 ? randEl(colors) : "#FFFFFF";

        const embed = new KEmbed()
            .setAuthor({
                name: `${account.player.acct.game_name}#${account.player.acct.tag_line} - ${title?.titleText}`,
                iconURL: card?.displayIcon,
                url: account.trackerURL
            })
            .setThumbnail(card?.largeArt ?? null)
            .setImage(card?.wideArt ?? null)
            .setColor(color);

        if (shopType)
            embed.setTitle(
                `${capitalize(shopType)} Shop ${
                    privacytype !== "friends" && privacytype === "private"
                        ? "Private"
                        : "Public"
                })`
            );
        if (time) embed.setDescription(`**Resets in <t:${time}:R>**`);

        return embed;
    }

    async wishlistCard(
        user: User,
        privacytype: PrivacyTypes,
        currentSelection: string
    ) {
        const embed = new KEmbed()
            .setAuthor({
                name: user.globalName ?? user.username,
                iconURL: user.displayAvatarURL() ?? null
            })
            .setThumbnail(user.displayAvatarURL() ?? null)
            .setImage(user.bannerURL() ?? null)
            .setColor("Random");

        embed.setTitle(
            `Valorant Wishlist (${
                privacytype !== "friends" && privacytype === "private"
                    ? "Private"
                    : "Public"
            }) - ${startCase(currentSelection)}`
        );

        return embed;
    }

    offerCard(skin: Weapons.WeaponSkins<"en-US">, offer: Store.Offer) {
        const contentTier = this.valorant.contentTiers.getByID(
            skin.contentTierUuid
        )!;

        const cost = Object.values(offer.Cost)[0];

        return new KEmbed()
            .setAuthor({
                name: skin.displayName,
                iconURL: contentTier?.displayIcon
            })
            .setThumbnail(skin.displayIcon)
            .setDescription(`**<:val_points:1114492900181553192> ${cost} VP**`)
            .setColor(`#${contentTier.highlightColor.slice(0, 6)}`);
    }
}
