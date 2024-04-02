import { container } from "@sapphire/framework";
import Valorant from "../..";

export default class ValorantPlayerTitles {
    private readonly data: IValorantPlayerTitle[];

    constructor(data: IValorantPlayerTitle[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find(
            (playerTitle) => playerTitle.displayName === name
        );
    }

    getByID(id: string) {
        return this.data.find((playerTitle) => playerTitle.uuid === id);
    }

    // TODO: Add Embed method
    embed = (playerTitle: IValorantPlayerTitle) =>
        container.util.embed()
            .setAuthor({
                name: playerTitle.displayName
            })
            .setTitle(playerTitle.titleText);

    // TODO: add player title prices
    static async fetch() {
        const titleData = await fetch(`${Valorant.assetsURL}/playertitles`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        const titlePrices = await fetch(
            "https://api.henrikdev.xyz/valorant/v2/store-offers"
        )
            .then((res) => res.json())
            .then((res: any) => res.data.offers)
            .then((res) =>
                res.filter((offer: any) => offer.type === "player_title")
            );

        const data = titleData.map((title: any) => ({
            ...title,
            cost:
                titlePrices.find(
                    (price: any) => price.player_title_id === title.uuid
                )?.cost ?? 0
        }));

        return new ValorantPlayerTitles(data);
    }
}
