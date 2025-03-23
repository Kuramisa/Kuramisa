import { Embed } from "@builders";
import Valorant from "../..";
import logger from "Logger";
import { fetch } from "@sapphire/fetch";

export default class ValorantThemes {
    private readonly data: IValorantTheme[];

    constructor(data: IValorantTheme[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (theme: string) =>
        this.data.find(
            (t) => t.displayName.toLowerCase() === theme.toLowerCase()
        ) ?? this.data.find((t) => t.uuid === theme);

    static async init() {
        const data = await fetch<any>(`${Valorant.assetsURL}/themes`)
            .then((res) => res.data)
            .catch((err) => {
                logger.error(err);
                return [];
            });

        return new ValorantThemes(data);
    }

    embed = (theme: IValorantTheme) =>
        new Embed()
            .setAuthor({
                name: theme.displayName,
                iconURL: theme.displayIcon,
            })
            .setTitle(theme.displayName)
            .setThumbnail(theme.displayIcon)
            .setImage(theme.storeFeaturedImage);
}
