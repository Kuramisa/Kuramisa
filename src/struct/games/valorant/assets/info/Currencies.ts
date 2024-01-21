import { Currencies } from "@valapi/valorant-api.com";

export default class ValorantCurrencies {
    private readonly data: Currencies.Currencies<"en-US">[];

    constructor(data: Currencies.Currencies<"en-US">[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find(currency => currency.displayName === name);
    }

    getByID(id: string) {
        return this.data.find(currency => currency.uuid === id);
    }
}