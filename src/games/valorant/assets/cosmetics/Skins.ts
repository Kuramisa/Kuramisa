import { fetch } from "@sapphire/fetch";
import { type ContentTiers, type Weapons } from "@valapi/valorant-api.com";
import { Embed } from "Builders";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Collection,
    type MessageActionRowComponentBuilder,
    StringSelectMenuBuilder,
} from "discord.js";
import truncate from "lodash/truncate";
import logger from "Logger";
import type {
    ValorantContentTier,
    ValorantSkin,
    ValorantSkinCollection,
    ValorantWeaponSkin,
    ValorantWeaponSkinLevel,
} from "typings/Valorant";

import Valorant from "../..";
import type Kuramisa from "../../../../Kuramisa";

export default class ValorantSkins {
    private readonly data: ValorantWeaponSkin[];

    constructor(data: ValorantWeaponSkin[]) {
        this.data = data;
    }

    get all() {
        return this.data.filter((skin) => skin.contentTierUuid);
    }

    get = (skin: string) =>
        this.data.find(
            (s) => s.displayName.toLowerCase() === skin.toLowerCase(),
        ) ??
        this.data.find((s) => s.uuid === skin) ??
        this.data.find(
            (s) =>
                s.levels.find(
                    (level) =>
                        level.displayName.toLowerCase() === skin.toLowerCase(),
                ) ?? s.levels.find((level) => level.uuid === skin),
        );

    static async init() {
        const data = await fetch<any>(`${Valorant.assetsURL}/weapons/skins`)
            .then((res) => res.data)
            .catch((err) => {
                logger.error(err);
                return [];
            });

        return new ValorantSkins(data);
    }

    info(client: Kuramisa, skin: ValorantWeaponSkin): ValorantSkin {
        const contentTier = client.games.valorant.contentTiers.get(
            skin.contentTierUuid,
        );
        if (!contentTier) throw new Error("Content Tier not found");

        // Level Information
        const levelNames = skin.levels.map((level) => level.displayName);
        const levelEmbeds = this.levelEmbeds(client, skin);
        const levelComponents =
            new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
                this.levelSelectMenu(skin),
            );
        const levelVideos = this.levelVideos(skin);

        // Chroma Information
        const chromaNames = skin.chromas.map((chroma) => chroma.displayName);
        const chromaEmbeds = this.chromaEmbeds(client, skin);
        const chromaComponents =
            new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
                this.chromaButtons(skin),
            );
        const chromaVideos = this.chromaVideos(skin);

        return {
            name: skin.displayName,
            uuid: skin.uuid,
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

    collection(client: Kuramisa, skins: ValorantWeaponSkin[]) {
        const collection: ValorantSkinCollection = new Collection<
            string,
            ValorantSkin
        >();

        for (const skin of skins) {
            collection.set(skin.uuid, this.info(client, skin));
        }

        return collection;
    }

    // Level Methods [START]
    levelEmbed = (
        skin: ValorantWeaponSkin,
        level: ValorantWeaponSkinLevel,
        contentTier: ValorantContentTier,
    ) =>
        new Embed()
            .setAuthor({
                name: level.displayName,
                iconURL: contentTier.displayIcon,
            })
            .setImage(level.displayIcon ?? skin.displayIcon)
            .setColor(`#${contentTier.highlightColor.slice(0, 6)}`);

    levelEmbeds = (client: Kuramisa, skin: ValorantWeaponSkin) =>
        skin.levels.map((level) =>
            this.levelEmbed(
                skin,
                level,
                client.games.valorant.contentTiers.get(skin.contentTierUuid)!,
            ),
        );

    levelSelectMenu = (skin: ValorantWeaponSkin) =>
        new StringSelectMenuBuilder()
            .setCustomId("valorant_weapon_skin_level_select")
            .setPlaceholder("Select a Skin Level")
            .setOptions(
                skin.levels.map((level, i) => ({
                    label: truncate(level.displayName, {
                        length: 99,
                    }),
                    value: i.toString(),
                })),
            );

    levelVideos = (skin: ValorantWeaponSkin) =>
        skin.levels.map((level) => level.streamedVideo);

    // Level Methods [END]

    // Chroma Methods [START]
    chromaEmbed = (
        skin: ValorantWeaponSkin,
        chroma: Weapons.WeaponSkinChromas<"en-US">,
        contentTier: ContentTiers.ContentTiers<"en-US">,
    ) =>
        new Embed()
            .setAuthor({
                name: chroma.displayName,
                iconURL: contentTier.displayIcon,
            })
            .setImage(chroma.fullRender ?? skin.displayIcon)
            .setColor(`#${contentTier.highlightColor.slice(0, 6)}`);

    chromaEmbeds = (client: Kuramisa, skin: ValorantWeaponSkin) =>
        skin.chromas.map((chroma) =>
            this.chromaEmbed(
                skin,
                chroma,
                client.games.valorant.contentTiers.get(skin.contentTierUuid)!,
            ),
        );

    chromaButton = (
        skin: ValorantWeaponSkin,
        chroma: Weapons.WeaponSkinChromas<"en-US">,
    ) => {
        const button = new ButtonBuilder()
            .setCustomId(
                `valorant_skin_chroma_${skin.chromas.findIndex(
                    (c) => c.uuid === chroma.uuid,
                )}`,
            )
            .setStyle(ButtonStyle.Secondary);

        let label = chroma.displayName.split(skin.displayName)[1];
        if (!label || label.length === 0) label = "Original";

        return button.setLabel(label);
    };

    chromaButtons = (skin: ValorantWeaponSkin) =>
        skin.chromas.map((chroma) => this.chromaButton(skin, chroma));

    chromaVideo = (chroma: Weapons.WeaponSkinChromas<"en-US">) =>
        chroma.streamedVideo;
    chromaVideos = (skin: ValorantWeaponSkin) =>
        skin.chromas.map((chroma) => this.chromaVideo(chroma));

    // Chroma Methods [END]
}
