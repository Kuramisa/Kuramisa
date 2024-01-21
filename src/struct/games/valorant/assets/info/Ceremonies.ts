import { Ceremonies } from "@valapi/valorant-api.com";

export default class ValorantCeremonies {
    private readonly data: Ceremonies.Ceremonies<"en-US">[];

    constructor(data: Ceremonies.Ceremonies<"en-US">[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (name: string) => this.data.find(ceremony => ceremony.displayName === name);
    getByID = (id: string) => this.data.find(ceremony => ceremony.uuid === id);
}