import {
    ActionRowBuilder,
    type MessageActionRowComponentBuilder,
    StringSelectMenuBuilder
} from "discord.js";
import Valorant from "../..";
import { KEmbed, KStringDropdown } from "@builders";
import { fetchStoreOffers } from "..";

export default class ValorantSprays {
    private readonly data: IValorantSpray[];

    constructor(data: IValorantSpray[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find((spray) => spray.displayName === name);
    }

    getByID(id: string) {
        return this.data.find((spray) => spray.uuid === id);
    }

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
                components: levelComponents
            }
        };
    }

    levelEmbed = (spray: IValorantSpray, level: IValorantSprayLevel) =>
        new KEmbed()
            .setAuthor({
                name: spray.displayName,
                iconURL: spray.displayIcon
            })
            .setTitle(level.displayName ?? spray.displayIcon)
            .setThumbnail(spray.animationGif ?? spray.fullTransparentIcon)
            .setColor("Random");

    levelEmbeds = (spray: IValorantSpray) =>
        spray.levels.map((level) => this.levelEmbed(spray, level));

    levelSelectMenu = (spray: IValorantSpray) =>
        new KStringDropdown()
            .setCustomId("valorant_spray_level_select")
            .setPlaceholder("Select a Spray Level")
            .setOptions(
                spray.levels.map((level, i) => ({
                    label: level.displayName,
                    value: i.toString()
                }))
            );

    static async fetch() {
        const sprayData = await fetch(`${Valorant.assetsURL}/sprays`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        const sprayPrices = await fetchStoreOffers()
            .then((res: any) => res.data?.offers)
            .then((res) => res?.filter((offer: any) => offer.type === "spray"));

        const data = sprayData.map((spray: any) => ({
            ...spray,
            cost:
                sprayPrices?.find((price: any) => price.spray_id === spray.uuid)
                    ?.cost ?? 0
        }));

        return new ValorantSprays(data);
    }
}
