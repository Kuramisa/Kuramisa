import { KEmbed } from "@builders";
import Valorant from "../..";

export default class ValorantThemes {
    private readonly data: IValorantTheme[];

    constructor(data: IValorantTheme[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find((theme) => theme.displayName === name);
    }

    getByID(id: string) {
        return this.data.find((theme) => theme.uuid === id);
    }

    static async fetch() {
        const data = await fetch(`${Valorant.assetsURL}/themes`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantThemes(data);
    }

    embed = (theme: IValorantTheme) =>
        new KEmbed()
            .setAuthor({
                name: theme.displayName,
                iconURL: theme.displayIcon
            })
            .setTitle(theme.displayName)
            .setThumbnail(theme.displayIcon)
            .setImage(theme.storeFeaturedImage);
}
