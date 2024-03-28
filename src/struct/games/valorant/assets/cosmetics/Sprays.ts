import Valorant from "../..";

export default class ValorantSprays {
    private readonly data: IValorantSpray[];

    constructor(data: IValorantSpray[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find((spray) => spray.displayName === name);
    }

    getByID(id: string) {
        return this.data.find((spray) => spray.uuid === id);
    }

    // TODO: Add Embed method

    // TODO: Add spray prices
    static async fetch() {
        const sprayData = await fetch(`${Valorant.assetsURL}/sprays`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        const sprayPrices = await fetch(
            `https://api.henrikdev.xyz/valorant/v2/store-offers`
        )
            .then((res) => res.json())
            .then((res: any) => res.data.offers)
            .then((res) => res.filter((offer: any) => offer.type === "spray"));

        const data = sprayData.map((spray: any) => ({
            ...spray,
            cost:
                sprayPrices.find((price: any) => price.spray_id === spray.uuid)
                    ?.cost ?? 0,
        }));

        return new ValorantSprays(data);
    }
}
