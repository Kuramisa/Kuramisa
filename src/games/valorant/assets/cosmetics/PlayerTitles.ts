import { fetch } from "@sapphire/fetch";
import { Embed } from "Builders";
import logger from "Logger";
import type { ValorantPlayerTitle } from "typings/Valorant";

import Valorant from "../..";

export default class ValorantPlayerTitles {
    private readonly data: ValorantPlayerTitle[];

    constructor(data: ValorantPlayerTitle[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (title: string) =>
        this.data.find(
            (playerTitle) =>
                playerTitle.displayName.toLowerCase() === title.toLowerCase(),
        ) ?? this.data.find((playerTitle) => playerTitle.uuid === title);

    embed = (playerTitle: ValorantPlayerTitle) =>
        new Embed()
            .setAuthor({
                name: playerTitle.displayName,
            })
            .setTitle(playerTitle.titleText);

    static async init() {
        const data = await fetch<any>(`${Valorant.assetsURL}/playertitles`)
            .then((res) => res.data)
            .catch((err) => {
                logger.error(err);
                return [];
            });

        return new ValorantPlayerTitles(data);
    }
}
