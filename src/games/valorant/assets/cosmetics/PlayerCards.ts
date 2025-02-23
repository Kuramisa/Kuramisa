import kuramisa from "@kuramisa";
import { Embed } from "@builders";
import Valorant from "../..";
import { fetchStoreOffers } from "..";

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
            .setDescription(
                `**${kuramisa.kEmojis.get("val_points") ?? ""} ${
                    playerCard.cost
                } VP**`
            )
            .setThumbnail(playerCard.largeArt)
            .setImage(playerCard.wideArt)
            .setColor("Orange");

    static async init() {
        const cardData = await fetch(`${Valorant.assetsURL}/playercards`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        const cardPrices = await fetchStoreOffers()
            .then((res: any) => res.data?.offers)
            .then((res) =>
                res?.filter((offer: any) => offer.type === "player_card")
            );

        const data = cardData.map((card: any) => ({
            ...card,
            cost:
                cardPrices?.find(
                    (price: any) => price.player_card_id === card.uuid
                )?.cost ?? 0,
        }));

        return new ValorantPlayerCards(data);
    }
}
