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

    // TODO: Add Embed method

    // TODO: Add card prices
    static async fetch() {
        const data = await fetch(`${Valorant.assetsURL}/playercards`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantPlayerCards(data);
    }
}
