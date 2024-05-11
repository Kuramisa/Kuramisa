import { LegacyClient as OsuApi } from "osu-web.js";
import Valorant from "./valorant";

const { OSU_API } = process.env;

export default class Games {
    readonly osu: OsuApi;
    readonly valorant: Valorant;

    constructor() {
        this.osu = new OsuApi(OSU_API ?? "");
        this.valorant = new Valorant();
    }
}
