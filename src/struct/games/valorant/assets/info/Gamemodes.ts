import { EmbedBuilder } from "discord.js";
import Valorant from "../..";

export default class ValorantGamemodes {
    private readonly data: IValorantGamemode[];

    constructor(data: IValorantGamemode[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find((gamemode) => gamemode.displayName === name);
    }

    getByID(id: string) {
        return this.data.find((gamemode) => gamemode.uuid === id);
    }

    static async fetch() {
        const data = await fetch(`${Valorant.assetsURL}/gamemodes`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantGamemodes(data);
    }

    // TODO: Add more embed info
    embed = (gamemode: IValorantGamemode) =>
        new EmbedBuilder()
            .setAuthor({
                name: gamemode.displayName,
                iconURL: gamemode.displayIcon
            })
            .setTitle(gamemode.displayName)
            .setThumbnail(gamemode.displayIcon);
}
