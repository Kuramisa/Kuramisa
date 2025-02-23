import { Embed } from "@builders";
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

    get = (title: string) =>
        this.data.find(
            (playerTitle) =>
                playerTitle.displayName.toLowerCase() === title.toLowerCase()
        ) ?? this.data.find((playerTitle) => playerTitle.uuid === title);

    embed = (playerTitle: IValorantPlayerTitle) =>
        new Embed()
            .setAuthor({
                name: playerTitle.displayName,
            })
            .setTitle(playerTitle.titleText);

    static async init() {
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
                )?.cost ?? 0,
        }));

        return new ValorantPlayerTitles(data);
    }
}
