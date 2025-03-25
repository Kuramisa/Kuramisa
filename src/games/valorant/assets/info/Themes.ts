import { Embed } from "Builders";

import { fetch } from "games/valorant/API";
import type { APIValorantTheme } from "typings/APIValorant";

export default class ValorantThemes {
    private readonly data: APIValorantTheme[];

    constructor(data: APIValorantTheme[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (theme: string) =>
        this.data.find(
            (t) => t.displayName.toLowerCase() === theme.toLowerCase(),
        ) ?? this.data.find((t) => t.uuid === theme);

    static async init() {
        return new ValorantThemes(await fetch("themes"));
    }

    embed = (theme: APIValorantTheme) =>
        new Embed()
            .setAuthor({
                name: theme.displayName,
                iconURL: theme.displayIcon,
            })
            .setTitle(theme.displayName)
            .setThumbnail(theme.displayIcon)
            .setImage(theme.storeFeaturedImage);
}
