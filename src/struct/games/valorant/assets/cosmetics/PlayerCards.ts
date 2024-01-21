import { PlayerCards } from "@valapi/valorant-api.com";

export default class ValorantPlayerCards {
    private readonly data: PlayerCards.PlayerCards<"en-US">[];

    constructor(data: PlayerCards.PlayerCards<"en-US">[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find(playerCard => playerCard.displayName === name);
    }

    getByID(id: string) {
        return this.data.find(playerCard => playerCard.uuid === id);
    }

    // TODO: Add Embed method
}