import kuramisa from "@kuramisa";
import { KEmbed } from "@utils";
import Valorant from "../..";

export default class ValorantPlayerCards {
    private readonly data: IValorantPlayerCard[];

    constructor(data: IValorantPlayerCard[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find((playerCard) => playerCard.displayName === name);
    }

    getByID(id: string) {
        return this.data.find((playerCard) => playerCard.uuid === id);
    }

    embed = (playerCard: IValorantPlayerCard) =>
        new KEmbed()
            .setAuthor({
                name: playerCard.displayName,
                iconURL: playerCard.displayIcon
            })
            .setDescription(
                `**${kuramisa.kEmojis.get("val_points")} ${
                    playerCard.cost
                } VP**`
            )
            .setThumbnail(playerCard.largeArt)
            .setImage(playerCard.wideArt)
            .setColor("Orange");

    static async fetch() {
        const cardData = await fetch(`${Valorant.assetsURL}/playercards`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        const cardPrices = await fetch(
            "https://api.henrikdev.xyz/valorant/v2/store-offers"
        )
            .then((res) => res.json())
            .then((res: any) => res.data?.offers)
            .then((res) =>
                res?.filter((offer: any) => offer.type === "player_card")
            );

        const data = cardData.map((card: any) => ({
            ...card,
            cost:
                cardPrices?.find(
                    (price: any) => price.player_card_id === card.uuid
                )?.cost ?? 0
        }));

        return new ValorantPlayerCards(data);
    }
}
