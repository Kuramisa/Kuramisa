import Valorant from "../..";
import { Embed } from "@builders";

export default class ValorantGamemodes {
    private readonly data: IValorantGamemode[];

    constructor(data: IValorantGamemode[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (gamemode: string) =>
        this.data.find((g) => g.displayName === gamemode) ??
        this.data.find((g) => g.uuid === gamemode);

    static async init() {
        const data = await fetch(`${Valorant.assetsURL}/gamemodes`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantGamemodes(data);
    }

    embed = (gamemode: IValorantGamemode) =>
        new Embed()
            .setAuthor({
                name: gamemode.displayName,
                iconURL: gamemode.displayIcon,
            })
            .setTitle(gamemode.displayName)
            .setThumbnail(gamemode.displayIcon);
}
