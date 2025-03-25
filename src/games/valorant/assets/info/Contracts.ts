import { fetch } from "games/valorant/API";
import type { APIValorantContract } from "typings/APIValorant";

export default class ValorantContracts {
    private readonly data: APIValorantContract[];

    constructor(data: APIValorantContract[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (contract: string) =>
        this.data.find(
            (c) => c.displayName.toLowerCase() === contract.toLowerCase(),
        ) ?? this.data.find((c) => c.uuid === contract);

    static async init() {
        return new ValorantContracts(await fetch("contracts"));
    }
}
