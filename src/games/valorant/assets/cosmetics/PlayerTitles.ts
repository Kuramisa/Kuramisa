import { Embed } from "@builders";
import Valorant from "../..";
import logger from "Logger";

export default class ValorantPlayerTitles {
    private readonly data: IValorantPlayerTitle[];

    constructor(data: IValorantPlayerTitle[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (title: string) =>
        this.data.find(
            (playerTitle) =>
                playerTitle.displayName.toLowerCase() === title.toLowerCase()
        ) ?? this.data.find((playerTitle) => playerTitle.uuid === title);

    embed = (playerTitle: IValorantPlayerTitle) =>
        new Embed()
            .setAuthor({
                name: playerTitle.displayName,
            })
            .setTitle(playerTitle.titleText);

    static async init() {
        const data = await fetch(`${Valorant.assetsURL}/playertitles`)
            .then((res) => res.json())
            .then((res: any) => res.data)
            .catch((err) => {
                logger.error(err);
                return [];
            });

        return new ValorantPlayerTitles(data);
    }
}
