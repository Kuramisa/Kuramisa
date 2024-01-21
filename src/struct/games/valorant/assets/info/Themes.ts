import { Themes } from "@valapi/valorant-api.com";
import { EmbedBuilder } from "discord.js";

export default class ValorantThemes {
    private readonly data: Themes.Themes<"en-US">[];

    constructor(data: Themes.Themes<"en-US">[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find(theme => theme.displayName === name);
    }

    getByID(id: string) {
        return this.data.find(theme => theme.uuid === id);
    }

    embed = (theme: Themes.Themes<"en-US">) => new EmbedBuilder()
        .setAuthor({
            name: theme.displayName,
            iconURL: theme.displayIcon
        })
        .setTitle(theme.displayName)
        .setThumbnail(theme.displayIcon)
        .setImage(theme.storeFeaturedImage);
}