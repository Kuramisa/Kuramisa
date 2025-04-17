import { Embed, StringDropdown } from "Builders";
import {
    ActionRowBuilder,
    type MessageActionRowComponentBuilder,
} from "discord.js";
import { fetch } from "games/valorant/API";
import type {
    APIValorantSpray,
    APIValorantSprayLevel,
} from "typings/APIValorant";

export default class ValorantSprays {
    private readonly data: APIValorantSpray[];

    constructor(data: APIValorantSpray[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (spray: string) =>
        this.data.find(
            (s) => s.displayName.toLowerCase() === spray.toLowerCase(),
        ) ?? this.data.find((s) => s.uuid === spray);

    info(spray: APIValorantSpray) {
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

    levelEmbed = (spray: APIValorantSpray, level: APIValorantSprayLevel) =>
        new Embed()
            .setAuthor({
                name: spray.displayName,
                iconURL: spray.displayIcon,
            })
            .setTitle(level.displayName)
            .setThumbnail(spray.animationGif ?? spray.fullTransparentIcon)
            .setColor("Random");

    levelEmbeds = (spray: APIValorantSpray) =>
        spray.levels.map((level) => this.levelEmbed(spray, level));

    levelSelectMenu = (spray: APIValorantSpray) =>
        new StringDropdown()
            .setCustomId("valorant_spray_level_select")
            .setPlaceholder("Select a Spray Level")
            .setOptions(
                spray.levels.map((level, i) => ({
                    label: level.displayName,
                    value: i.toString(),
                })),
            );

    static readonly init = async () =>
        new ValorantSprays(await fetch("sprays"));
}
