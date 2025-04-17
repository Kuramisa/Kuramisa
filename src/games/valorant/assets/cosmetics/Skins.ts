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
import type {
    APIValorantContentTier,
    APIValorantSkin,
    APIValorantSkinChroma,
    APIValorantSkinLevel,
} from "typings/APIValorant";

import { container } from "@sapphire/pieces";
import { fetch } from "games/valorant/API";
import type { ValorantSkinInfo } from "typings/Valorant";

export default class ValorantSkins {
    private readonly data: APIValorantSkin[];

    constructor(data: APIValorantSkin[]) {
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

    static readonly init = async () =>
        new ValorantSkins(await fetch("weapons/skins"));

    info(skin: APIValorantSkin): ValorantSkinInfo {
        // Level Information
        const levelNames = skin.levels.map((level) => level.displayName);
        const levelEmbeds = this.levelEmbeds(skin);
        const levelComponents =
            new ActionRowBuilder<MessageActionRowComponentBuilder>().setComponents(
                this.levelSelectMenu(skin),
            );
        const levelVideos = this.levelVideos(skin);

        // Chroma Information
        const chromaNames = skin.chromas.map((chroma) => chroma.displayName);
        const chromaEmbeds = this.chromaEmbeds(skin);
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

    collection(skins: APIValorantSkin[]) {
        const collection = new Collection<string, ValorantSkinInfo>();

        for (const skin of skins) {
            collection.set(skin.uuid, this.info(skin));
        }

        return collection;
    }

    // Level Methods [START]
    levelEmbed = (
        skin: APIValorantSkin,
        level?: APIValorantSkinLevel,
        contentTier?: APIValorantContentTier,
    ) =>
        new Embed()
            .setAuthor({
                name: level?.displayName ?? skin.displayName,
                iconURL: contentTier?.displayIcon,
            })
            .setImage(level?.displayIcon ?? skin.displayIcon)
            .setColor(`#${contentTier?.highlightColor.slice(0, 6)}`);

    levelEmbeds = (skin: APIValorantSkin) =>
        skin.levels.map((level) =>
            this.levelEmbed(
                skin,
                level,
                container.client.games.valorant.contentTiers.get(
                    skin.contentTierUuid,
                ),
            ),
        );

    levelSelectMenu = (skin: APIValorantSkin) =>
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

    levelVideos = (skin: APIValorantSkin) =>
        skin.levels.map((level) => level.streamedVideo);

    // Level Methods [END]

    // Chroma Methods [START]
    chromaEmbed = (
        skin: APIValorantSkin,
        chroma: APIValorantSkinChroma,
        contentTier?: APIValorantContentTier,
    ) =>
        new Embed()
            .setAuthor({
                name: chroma.displayName,
                iconURL: contentTier?.displayIcon,
            })
            .setImage(chroma.fullRender ?? skin.displayIcon)
            .setColor(`#${contentTier?.highlightColor.slice(0, 6)}`);

    chromaEmbeds = (skin: APIValorantSkin) =>
        skin.chromas.map((chroma) =>
            this.chromaEmbed(
                skin,
                chroma,
                container.client.games.valorant.contentTiers.get(
                    skin.contentTierUuid,
                ),
            ),
        );

    chromaButton = (skin: APIValorantSkin, chroma: APIValorantSkinChroma) => {
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

    chromaButtons = (skin: APIValorantSkin) =>
        skin.chromas.map((chroma) => this.chromaButton(skin, chroma));

    chromaVideo = (chroma: APIValorantSkinChroma) => chroma.streamedVideo;
    chromaVideos = (skin: APIValorantSkin) =>
        skin.chromas.map((chroma) => this.chromaVideo(chroma));

    // Chroma Methods [END]
}
