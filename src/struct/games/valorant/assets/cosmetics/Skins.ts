import { ContentTiers, Weapons } from "@valapi/valorant-api.com";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Collection,
    EmbedBuilder,
    type MessageActionRowComponentBuilder,
    StringSelectMenuBuilder,
} from "discord.js";
import { container } from "@sapphire/framework";
import type {
    ValorantSkin,
    ValorantSkinCollection,
} from "../../../../../@types";

export default class ValorantSkins {
    private readonly data: Weapons.WeaponSkins<"en-US">[];

    constructor(data: Weapons.WeaponSkins<"en-US">[]) {
        this.data = data;
    }

    get all() {
        return this.data.filter((skin) => skin.contentTierUuid);
    }

    get(name: string) {
        return this.data.find(
            (skin) =>
                skin.displayName === name ||
                skin.levels.find((level) => level.displayName === name)
        );
    }

    getByID(id: string) {
        return this.data.find((skin) => skin.uuid === id);
    }

    // TODO: Add Embed method
    info(skin: Weapons.WeaponSkins<"en-US">): ValorantSkin {
        const contentTier = container.games.valorant.contentTiers.getByID(
            skin.contentTierUuid
        );
        if (!contentTier) throw new Error("Content Tier not found");

        // Level Information
        const levelNames = skin.levels.map((level) => level.displayName);
        const levelEmbeds = this.levelEmbeds(skin);
        const levelComponents =
            new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
                this.levelSelectMenu(skin)
            );
        const levelVideos = this.levelVideos(skin);

        // Chroma Information
        const chromaNames = skin.chromas.map((chroma) => chroma.displayName);
        const chromaEmbeds = this.chromaEmbeds(skin);
        const chromaComponents =
            new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
                this.chromaButtons(skin)
            );
        const chromaVideos = this.chromaVideos(skin);

        return {
            level: {
                names: levelNames,
                embeds: levelEmbeds,
                components: levelComponents,
                videos: levelVideos,
            },
            chroma: {
                names: chromaNames,
                embeds: chromaEmbeds,
                components: chromaComponents,
                videos: chromaVideos,
            },
        };
    }

    collection(skins: Weapons.WeaponSkins<"en-US">[]): ValorantSkinCollection {
        const collection: ValorantSkinCollection = new Collection();

        for (const skin of skins) {
            collection.set(skin.uuid, this.info(skin));
        }

        return collection;
    }

    // Level Methods [START]
    levelEmbed = (
        skin: Weapons.WeaponSkins<"en-US">,
        level: Weapons.WeaponSkinLevels<"en-US">,
        contentTier: ContentTiers.ContentTiers<"en-US">
    ) =>
        new EmbedBuilder()
            .setAuthor({
                name: level.displayName,
                iconURL: contentTier.displayIcon,
            })
            .setImage(level.displayIcon ?? skin.displayIcon)
            .setColor(`#${contentTier.highlightColor.slice(0, 6)}`);

    levelEmbeds = (skin: Weapons.WeaponSkins<"en-US">) =>
        skin.levels.map((level) =>
            this.levelEmbed(
                skin,
                level,
                container.games.valorant.contentTiers.getByID(
                    skin.contentTierUuid
                )!
            )
        );

    levelSelectMenu = (skin: Weapons.WeaponSkins<"en-US">) =>
        new StringSelectMenuBuilder()
            .setCustomId("valorant_weapon_skin_level_select")
            .setPlaceholder("Select a level")
            .setOptions(
                skin.levels.map((level, i) => ({
                    label: level.displayName,
                    value: i.toString(),
                }))
            );

    levelVideos = (skin: Weapons.WeaponSkins<"en-US">) =>
        skin.levels.map((level) => level.streamedVideo);

    // Level Methods [END]

    // Chroma Methods [START]
    chromaEmbed = (
        skin: Weapons.WeaponSkins<"en-US">,
        chroma: Weapons.WeaponSkinChromas<"en-US">,
        contentTier: ContentTiers.ContentTiers<"en-US">
    ) =>
        new EmbedBuilder()
            .setAuthor({
                name: chroma.displayName,
                iconURL: contentTier.displayIcon,
            })
            .setImage(chroma.fullRender ?? skin.displayIcon)
            .setColor(`#${contentTier.highlightColor.slice(0, 6)}`);

    chromaEmbeds = (skin: Weapons.WeaponSkins<"en-US">) =>
        skin.chromas.map((chroma) =>
            this.chromaEmbed(
                skin,
                chroma,
                container.games.valorant.contentTiers.getByID(
                    skin.contentTierUuid
                )!
            )
        );

    chromaButton = (
        skin: Weapons.WeaponSkins<"en-US">,
        chroma: Weapons.WeaponSkinChromas<"en-US">
    ) =>
        new ButtonBuilder()
            .setCustomId(
                `valorant_skin_chroma_${skin.chromas.findIndex(
                    (c) => c.uuid === chroma.uuid
                )}`
            )
            .setLabel(
                chroma.displayName
                    .split(skin.displayName)[1]
                    ?.split("\n")[1]
                    ?.replaceAll("(", "")
                    ?.replaceAll(")", "")
                    ?.trim() ?? "Original"
            )
            .setStyle(ButtonStyle.Secondary);

    chromaButtons = (skin: Weapons.WeaponSkins<"en-US">) =>
        skin.chromas.map((chroma) => this.chromaButton(skin, chroma));

    chromaVideo = (chroma: Weapons.WeaponSkinChromas<"en-US">) =>
        chroma.streamedVideo;
    chromaVideos = (skin: Weapons.WeaponSkins<"en-US">) =>
        skin.chromas.map((chroma) => this.chromaVideo(chroma));

    // Chroma Methods [END]
}
