import Valorant from "../..";

export default class ValorantCurrencies {
    private readonly data: IValorantCurrency[];

    constructor(data: IValorantCurrency[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (currency: string) =>
        this.data.find(
            (c) => c.displayName.toLowerCase() === currency.toLowerCase()
        ) ?? this.data.find((c) => c.uuid === currency);

    static async init() {
        const data = await fetch(`${Valorant.assetsURL}/currencies`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantCurrencies(data);
    }
}
