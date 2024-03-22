import { LegacyClient as OsuApi } from "osu-web.js";
import Valorant from "./games/valorant";
import Warframe from "./games/Warframe";

const { OSU_API, STEAM_API } = process.env;

export default class Games {
    readonly osu: OsuApi;
    readonly valorant: Valorant;
    readonly warframe: Warframe;

    constructor() {
        this.osu = new OsuApi(OSU_API ?? "");
        this.valorant = new Valorant();
        this.warframe = new Warframe();
    }
}
