import { fetch } from "@sapphire/fetch";
import { Embed, StringDropdown } from "Builders";
import {
    ActionRowBuilder,
    type MessageActionRowComponentBuilder,
} from "discord.js";
import logger from "Logger";
import type { ValorantSpray, ValorantSprayLevel } from "typings/Valorant";

import Valorant from "../..";

export default class ValorantSprays {
    private readonly data: ValorantSpray[];

    constructor(data: ValorantSpray[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (spray: string) =>
        this.data.find(
            (s) => s.displayName.toLowerCase() === spray.toLowerCase(),
        ) ?? this.data.find((s) => s.uuid === spray);

    info(spray: ValorantSpray) {
        // Level Information
        const levelNames = spray.levels.map((level) => level.displayName);
        const levelEmbeds = this.levelEmbeds(spray);
        const levelComponents =
            new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                this.levelSelectMenu(spray),
            );

        return {
            name: spray.displayName,
            uuid: spray.uuid,
            level: {
                names: levelNames,
                embeds: levelEmbeds,
                components: levelComponents,
            },
        };
    }

    levelEmbed = (spray: ValorantSpray, level: ValorantSprayLevel) =>
        new Embed()
            .setAuthor({
                name: spray.displayName,
                iconURL: spray.displayIcon,
            })
            .setTitle(level.displayName ?? spray.displayIcon)
            .setThumbnail(spray.animationGif ?? spray.fullTransparentIcon)
            .setColor("Random");

    levelEmbeds = (spray: ValorantSpray) =>
        spray.levels.map((level) => this.levelEmbed(spray, level));

    levelSelectMenu = (spray: ValorantSpray) =>
        new StringDropdown()
            .setCustomId("valorant_spray_level_select")
            .setPlaceholder("Select a Spray Level")
            .setOptions(
                spray.levels.map((level, i) => ({
                    label: level.displayName,
                    value: i.toString(),
                })),
            );

    static async init() {
        const data = await fetch<any>(`${Valorant.assetsURL}/sprays`)
            .then((res) => res.data)
            .catch((err) => {
                logger.error(err);
                return [];
            });

        return new ValorantSprays(data);
    }
}
