import { Seasons } from "@valapi/valorant-api.com";

export default class ValorantSeasons {
    private readonly data: Seasons.Seasons<"en-US">[];

    constructor(data: Seasons.Seasons<"en-US">[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get current() {
        return this.data.at(-1);
    }

    get(name: string) {
        return this.data.find(season => season.displayName === name);
    }

    getByID(id: string) {
        return this.data.find(season => season.uuid === id);
    }

    // TODO: Add Embed method
}