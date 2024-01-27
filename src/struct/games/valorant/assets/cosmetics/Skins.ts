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

import Valorant from "../..";

export default class ValorantSkins {
    private readonly data: IValorantWeaponSkin[];

    constructor(data: IValorantWeaponSkin[]) {
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

    static async fetch() {
        const skinData = await fetch(`${Valorant.assetsURL}/weapons/skins`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        const skinPrices = await fetch(
            `https://api.henrikdev.xyz/valorant/v2/store-offers`
        )
            .then((res) => res.json())
            .then((res: any) => res.data.offers)
            .then((res) =>
                res.filter((offer: any) => offer.type === "skin_level")
            );

        const data = skinData.map((skin: any) => ({
            ...skin,
            cost:
                skinPrices.find((price: any) => price.skin_id === skin.uuid)
                    ?.cost ?? 0,
        }));

        return new ValorantSkins(data);
    }

    info(skin: IValorantWeaponSkin): ValorantSkin {
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

    collection(skins: IValorantWeaponSkin[]): ValorantSkinCollection {
        const collection: ValorantSkinCollection = new Collection();

        for (const skin of skins) {
            collection.set(skin.uuid, this.info(skin));
        }

        return collection;
    }

    // Level Methods [START]
    levelEmbed = (
        skin: IValorantWeaponSkin,
        level: IValorantWeaponSkinLevel,
        contentTier: IValorantContentTier
    ) =>
        new EmbedBuilder()
            .setAuthor({
                name: level.displayName,
                iconURL: contentTier.displayIcon,
            })
            .setDescription(
                `**${container.emojis.get("val_points")} ${skin.cost} VP**`
            )
            .setImage(level.displayIcon ?? skin.displayIcon)
            .setColor(`#${contentTier.highlightColor.slice(0, 6)}`);

    levelEmbeds = (skin: IValorantWeaponSkin) =>
        skin.levels.map((level) =>
            this.levelEmbed(
                skin,
                level,
                container.games.valorant.contentTiers.getByID(
                    skin.contentTierUuid
                )!
            )
        );

    levelSelectMenu = (skin: IValorantWeaponSkin) =>
        new StringSelectMenuBuilder()
            .setCustomId("valorant_weapon_skin_level_select")
            .setPlaceholder("Select a level")
            .setOptions(
                skin.levels.map((level, i) => ({
                    label: container.util.shorten(level.displayName, 99),
                    value: i.toString(),
                }))
            );

    levelVideos = (skin: IValorantWeaponSkin) =>
        skin.levels.map((level) => level.streamedVideo);

    // Level Methods [END]

    // Chroma Methods [START]
    chromaEmbed = (
        skin: IValorantWeaponSkin,
        chroma: Weapons.WeaponSkinChromas<"en-US">,
        contentTier: ContentTiers.ContentTiers<"en-US">
    ) =>
        new EmbedBuilder()
            .setAuthor({
                name: chroma.displayName,
                iconURL: contentTier.displayIcon,
            })
            .setDescription(
                `**${container.emojis.get("val_points")} ${skin.cost}**`
            )
            .setImage(chroma.fullRender ?? skin.displayIcon)
            .setColor(`#${contentTier.highlightColor.slice(0, 6)}`);

    chromaEmbeds = (skin: IValorantWeaponSkin) =>
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
        skin: IValorantWeaponSkin,
        chroma: Weapons.WeaponSkinChromas<"en-US">
    ) => {
        console.log(chroma.displayName.split(skin.displayName)[1]);

        const button = new ButtonBuilder()
            .setCustomId(
                `valorant_skin_chroma_${skin.chromas.findIndex(
                    (c) => c.uuid === chroma.uuid
                )}`
            )
            .setStyle(ButtonStyle.Secondary);

        let label = chroma.displayName.split(skin.displayName)[1];
        if (!label || label.length === 0) label = "Original";

        return button.setLabel(label);
    };

    chromaButtons = (skin: IValorantWeaponSkin) =>
        skin.chromas.map((chroma) => this.chromaButton(skin, chroma));

    chromaVideo = (chroma: Weapons.WeaponSkinChromas<"en-US">) =>
        chroma.streamedVideo;
    chromaVideos = (skin: IValorantWeaponSkin) =>
        skin.chromas.map((chroma) => this.chromaVideo(chroma));

    // Chroma Methods [END]
}
