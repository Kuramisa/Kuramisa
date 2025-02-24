import { Embed } from "@builders";
import Valorant from "../..";

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
        const data = await fetch(`${Valorant.assetsURL}/playercards`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantPlayerCards(data);
    }
}
