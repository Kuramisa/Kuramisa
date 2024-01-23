import { LegacyClient as OsuApi } from "osu-web.js";
//import SteamAPI from "steamapi";
import Valorant from "./games/valorant";
import Warframe from "./games/Warframe";

const { OSU_API, STEAM_API } = process.env;

export default class Games {
    readonly osu: OsuApi;
    // readonly steam: SteamAPI;
    readonly valorant: Valorant;
    readonly warframe: Warframe;

    // TODO: Bring back SteamAPI when it gets fixed for Yarn or Bun

    constructor() {
        this.osu = new OsuApi(OSU_API ?? "");
        //this.steam = new SteamAPI(STEAM_API ?? "");
        this.valorant = new Valorant();
        this.warframe = new Warframe();
    }
}
