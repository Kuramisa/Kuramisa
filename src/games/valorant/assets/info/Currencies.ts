import { fetch } from "@sapphire/fetch";
import logger from "Logger";
import type { ValorantCurrency } from "typings/Valorant";

import Valorant from "../..";

export default class ValorantCurrencies {
    private readonly data: ValorantCurrency[];

    constructor(data: ValorantCurrency[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (currency: string) =>
        this.data.find(
            (c) => c.displayName.toLowerCase() === currency.toLowerCase(),
        ) ?? this.data.find((c) => c.uuid === currency);

    static async init() {
        const data = await fetch<any>(`${Valorant.assetsURL}/currencies`)
            .then((res) => res.data)
            .catch((err) => {
                logger.error(err);
                return [];
            });

        return new ValorantCurrencies(data);
    }
}
