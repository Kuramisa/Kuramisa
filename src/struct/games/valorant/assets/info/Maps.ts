import { Maps } from "@valapi/valorant-api.com";
import { EmbedBuilder } from "discord.js";

export default class ValorantMaps {
    private readonly data: Maps.Maps<"en-US">[];

    constructor(data: Maps.Maps<"en-US">[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find(map => map.displayName === name);
    }

    getByID(id: string) {
        return this.data.find(map => map.uuid === id);
    }

    embed = (map: Maps.Maps<"en-US">) => new EmbedBuilder()
        .setAuthor({
            name: map.displayName,
            iconURL: map.displayIcon
        })
        .setTitle(`${map.displayName} - ${map.coordinates}`)
        .setDescription(map.narrativeDescription)
        .setImage(map.splash)
        .setThumbnail(map.listViewIcon)
        .addFields(
            {
                name: "Tactical Description",
                value: map.tacticalDescription
            },
            {
                name: "Callouts",
                value: map.callouts.map(callout => `${callout.regionName} - ${callout.superRegionName} (X: ${callout.location.x} - Y: ${callout.location.y})`).join("\n")
            }
        );
}