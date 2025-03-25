import type Kuramisa from "Kuramisa";

import Valorant from "./valorant";

export default class Games {
    readonly valorant: Valorant;

    constructor(client: Kuramisa) {
        this.valorant = new Valorant(client);
    }
}
