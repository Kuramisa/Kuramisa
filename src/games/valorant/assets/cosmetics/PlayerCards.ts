import { Embed } from "@builders";
import Valorant from "../..";
import logger from "Logger";
import { fetch } from "@sapphire/fetch";

export default class ValorantPlayerCards {
    private readonly data: IValorantPlayerCard[];

    constructor(data: IValorantPlayerCard[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (card: string) =>
        this.data.find((c) => c.uuid === card) ??
        this.data.find((c) => c.displayName === card);

    embed = (playerCard: IValorantPlayerCard) =>
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
