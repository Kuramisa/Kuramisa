import { KEmbed } from "@builders";
import Valorant from "../..";
import { fetchStoreOffers } from "..";

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

    embed = (playerTitle: IValorantPlayerTitle) =>
        new KEmbed()
            .setAuthor({
                name: playerTitle.displayName
            })
            .setTitle(playerTitle.titleText);

    static async fetch() {
        const titleData = await fetch(`${Valorant.assetsURL}/playertitles`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        const titlePrices = await fetchStoreOffers()
            .then((res: any) => res.data?.offers)
            .then((res) =>
                res?.filter((offer: any) => offer.type === "player_title")
            );

        const data = titleData.map((title: any) => ({
            ...title,
            cost:
                titlePrices?.find(
                    (price: any) => price.player_title_id === title.uuid
                )?.cost ?? 0
        }));

        return new ValorantPlayerTitles(data);
    }
}
