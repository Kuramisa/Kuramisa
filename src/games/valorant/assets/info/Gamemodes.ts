import logger from "Logger";
import Valorant from "../..";
import { Embed } from "@builders";
import { fetch } from "@sapphire/fetch";

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
        const data = await fetch<any>(`${Valorant.assetsURL}/gamemodes`)
            .then((res) => res.data)
            .catch((err) => {
                logger.error(err);
                return [];
            });

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
