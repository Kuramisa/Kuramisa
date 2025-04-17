import { fetch } from "games/valorant/API";
import type { APIValorantCompetitiveSeason } from "typings/APIValorant";

export default class ValorantCompetitiveSeasons {
    private readonly data: APIValorantCompetitiveSeason[];

    constructor(data: APIValorantCompetitiveSeason[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get current() {
        return this.data.at(-1);
    }

    get = (season: string) =>
        this.data.find((s) => s.seasonUuid === season) ??
        this.data.find((s) => s.uuid === season);

    static readonly init = async () =>
        new ValorantCompetitiveSeasons(await fetch("seasons/competitive"));
}
