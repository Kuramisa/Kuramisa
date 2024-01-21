import { Seasons } from "@valapi/valorant-api.com";

export default class ValorantCompetitiveSeasons {
    private readonly data: Seasons.CompetitiveSeasons[];

    constructor(data: Seasons.CompetitiveSeasons[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get current() {
        return this.data.at(-1);
    }

    get = (id: string) => this.data.find(season => season.uuid === id || season.seasonUuid === id);
}