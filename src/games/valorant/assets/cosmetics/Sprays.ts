import {
    ActionRowBuilder,
    type MessageActionRowComponentBuilder,
} from "discord.js";
import Valorant from "../..";
import { Embed, StringDropdown } from "@builders";

export default class ValorantSprays {
    private readonly data: IValorantSpray[];

    constructor(data: IValorantSpray[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (spray: string) =>
        this.data.find(
            (s) => s.displayName.toLowerCase() === spray.toLowerCase()
        ) ?? this.data.find((s) => s.uuid === spray);

    info(spray: IValorantSpray) {
        // Level Information
        const levelNames = spray.levels.map((level) => level.displayName);
        const levelEmbeds = this.levelEmbeds(spray);
        const levelComponents =
            new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                this.levelSelectMenu(spray)
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

    levelEmbed = (spray: IValorantSpray, level: IValorantSprayLevel) =>
        new Embed()
            .setAuthor({
                name: spray.displayName,
                iconURL: spray.displayIcon,
            })
            .setTitle(level.displayName ?? spray.displayIcon)
            .setThumbnail(spray.animationGif ?? spray.fullTransparentIcon)
            .setColor("Random");

    levelEmbeds = (spray: IValorantSpray) =>
        spray.levels.map((level) => this.levelEmbed(spray, level));

    levelSelectMenu = (spray: IValorantSpray) =>
        new StringDropdown()
            .setCustomId("valorant_spray_level_select")
            .setPlaceholder("Select a Spray Level")
            .setOptions(
                spray.levels.map((level, i) => ({
                    label: level.displayName,
                    value: i.toString(),
                }))
            );

    static async init() {
        const data = await fetch(`${Valorant.assetsURL}/sprays`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantSprays(data);
    }
}
