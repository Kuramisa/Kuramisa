import { PlayerTitles } from "@valapi/valorant-api.com";

export default class ValorantPlayerTitles {
    private readonly data: PlayerTitles.PlayerTitles<"en-US">[];

    constructor(data: PlayerTitles.PlayerTitles<"en-US">[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find(playerTitle => playerTitle.displayName === name);
    }

    getByID(id: string) {
        return this.data.find(playerTitle => playerTitle.uuid === id);
    }

    // TODO: Add Embed method
}