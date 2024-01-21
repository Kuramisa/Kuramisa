import { Gamemodes } from "@valapi/valorant-api.com";
import { EmbedBuilder } from "discord.js";

export default class ValorantGamemodes {
    private readonly data: Gamemodes.Gamemodes<"en-US">[];

    constructor(data: Gamemodes.Gamemodes<"en-US">[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find(gamemode => gamemode.displayName === name);
    }

    getByID(id: string) {
        return this.data.find(gamemode => gamemode.uuid === id);
    }

    // TODO: Add more embed info
    embed = (gamemode: Gamemodes.Gamemodes<"en-US">) => new EmbedBuilder()
        .setAuthor({
            name: gamemode.displayName,
            iconURL: gamemode.displayIcon
        })
        .setTitle(gamemode.displayName)
        .setThumbnail(gamemode.displayIcon);
}