import { Embed } from "@builders";
import { fetch } from "@games/valorant/API";
import type { APIValorantPlayerCard } from "@typings/APIValorant";

export default class ValorantPlayerCards {
    private readonly data: APIValorantPlayerCard[];

    constructor(data: APIValorantPlayerCard[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (card: string) =>
        this.data.find((c) => c.uuid === card) ??
        this.data.find((c) => c.displayName === card);

    embed = (playerCard: APIValorantPlayerCard) =>
        new Embed()
            .setAuthor({
                name: playerCard.displayName,
                iconURL: playerCard.displayIcon,
            })
            .setThumbnail(playerCard.largeArt)
            .setImage(playerCard.wideArt)
            .setColor("Orange");

    static readonly init = async () =>
        new ValorantPlayerCards(await fetch("playercards"));
}
