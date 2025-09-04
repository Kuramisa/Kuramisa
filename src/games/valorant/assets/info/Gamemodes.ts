import { Embed } from "@builders";
import { fetch } from "@games/valorant/API";
import type { APIValorantGamemode } from "@typings/APIValorant";

export default class ValorantGamemodes {
    private readonly data: APIValorantGamemode[];

    constructor(data: APIValorantGamemode[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (gamemode: string) =>
        this.data.find((g) => g.displayName === gamemode) ??
        this.data.find((g) => g.uuid === gamemode);

    static readonly init = async () =>
        new ValorantGamemodes(await fetch("gamemodes"));

    embed = (gamemode: APIValorantGamemode) =>
        new Embed()
            .setAuthor({
                name: gamemode.displayName,
                iconURL: gamemode.displayIcon,
            })
            .setTitle(gamemode.displayName)
            .setThumbnail(gamemode.displayIcon);
}
