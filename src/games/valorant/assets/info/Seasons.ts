import type { APIValorantSeason } from "typings/APIValorant";

import { fetch } from "games/valorant/API";

export default class ValorantSeasons {
    private readonly data: APIValorantSeason[];

    constructor(data: APIValorantSeason[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get current() {
        return this.data.at(-1);
    }

    get = (season: string) =>
        this.data.find((s) => s.displayName === season) ??
        this.data.find((s) => s.uuid === season);

    static readonly init = async () =>
        new ValorantSeasons(await fetch("seasons"));
}
