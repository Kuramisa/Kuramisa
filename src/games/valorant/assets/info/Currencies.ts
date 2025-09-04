import { fetch } from "@games/valorant/API";
import type { APIValorantCurrency } from "@typings/APIValorant";

export default class ValorantCurrencies {
    private readonly data: APIValorantCurrency[];

    constructor(data: APIValorantCurrency[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (currency: string) =>
        this.data.find(
            (c) => c.displayName.toLowerCase() === currency.toLowerCase(),
        ) ?? this.data.find((c) => c.uuid === currency);

    static readonly init = async () =>
        new ValorantCurrencies(await fetch("currencies"));
}
