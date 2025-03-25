import { fetch } from "@sapphire/fetch";
import { Embed } from "Builders";
import logger from "Logger";
import type { ValorantPlayerCard } from "typings/Valorant";

import Valorant from "../..";

export default class ValorantPlayerCards {
    private readonly data: ValorantPlayerCard[];

    constructor(data: ValorantPlayerCard[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (card: string) =>
        this.data.find((c) => c.uuid === card) ??
        this.data.find((c) => c.displayName === card);

    embed = (playerCard: ValorantPlayerCard) =>
        new Embed()
            .setAuthor({
                name: playerCard.displayName,
                iconURL: playerCard.displayIcon,
            })
            .setThumbnail(playerCard.largeArt)
            .setImage(playerCard.wideArt)
            .setColor("Orange");

    static async init() {
        const data = await fetch<any>(`${Valorant.assetsURL}/playercards`)
            .then((res) => res.data)
            .catch((err) => {
                logger.error(err);
                return [];
            });

        return new ValorantPlayerCards(data);
    }
}
