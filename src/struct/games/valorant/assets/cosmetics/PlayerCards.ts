import { EmbedBuilder } from "discord.js";
import Valorant from "../..";
import { container } from "@sapphire/framework";

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

    // TODO: Add Embed method
    embed = (playerCard: IValorantPlayerCard) =>
        new EmbedBuilder()
            .setAuthor({
                name: playerCard.displayName,
                iconURL: playerCard.displayIcon,
            })
            .setDescription(
                `**${container.emojis.get("val_points")} ${
                    playerCard.cost
                } VP**`
            )
            .setThumbnail(playerCard.largeArt)
            .setImage(playerCard.wideArt)
            .setColor("Random");

    // TODO: Add card prices
    static async fetch() {
        const cardData = await fetch(`${Valorant.assetsURL}/playercards`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        const cardPrices = await fetch(
            `https://api.henrikdev.xyz/valorant/v2/store-offers`
        )
            .then((res) => res.json())
            .then((res: any) => res.data.offers)
            .then((res) =>
                res.filter((offer: any) => offer.type === "player_card")
            );

        const data = cardData.map((card: any) => ({
            ...card,
            cost:
                cardPrices.find(
                    (price: any) => price.player_card_id === card.uuid
                )?.cost ?? 0,
        }));

        return new ValorantPlayerCards(data);
    }
}
