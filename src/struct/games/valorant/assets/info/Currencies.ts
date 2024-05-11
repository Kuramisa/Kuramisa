import Valorant from "../..";

export default class ValorantCurrencies {
    private readonly data: IValorantCurrency[];

    constructor(data: IValorantCurrency[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find((currency) => currency.displayName === name);
    }

    getByID(id: string) {
        return this.data.find((currency) => currency.uuid === id);
    }

    static async fetch() {
        const data = await fetch(`${Valorant.assetsURL}/currencies`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantCurrencies(data);
    }
}
