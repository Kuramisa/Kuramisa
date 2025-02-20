import Valorant from "./valorant";

export default class Games {
    readonly valorant: Valorant;
    constructor() {
        this.valorant = new Valorant();
    }
}
