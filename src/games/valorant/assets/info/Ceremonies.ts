import { fetch } from "games/valorant/API";
import type { APIValorantCeremony } from "typings/APIValorant";

export default class ValorantCeremonies {
    private readonly data: APIValorantCeremony[];

    constructor(data: APIValorantCeremony[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (ceremony: string) =>
        this.data.find(
            (c) => c.displayName.toLowerCase() === ceremony.toLowerCase(),
        ) ?? this.data.find((c) => c.uuid === ceremony);

    static async init() {
        return new ValorantCeremonies(await fetch("ceremonies"));
    }
}
