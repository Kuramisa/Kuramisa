import { Embed } from "Builders";
import { fetch } from "games/valorant/API";
import type { APIValorantPlayerTitle } from "typings/APIValorant";

export default class ValorantPlayerTitles {
    private readonly data: APIValorantPlayerTitle[];

    constructor(data: APIValorantPlayerTitle[]) {
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

    embed = (playerTitle: APIValorantPlayerTitle) =>
        new Embed()
            .setAuthor({
                name: playerTitle.displayName,
            })
            .setTitle(playerTitle.titleText);

    static async init() {
        return new ValorantPlayerTitles(await fetch("playertitles"));
    }
}
