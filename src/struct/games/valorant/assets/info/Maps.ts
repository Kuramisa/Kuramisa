import { EmbedBuilder } from "discord.js";
import Valorant from "../..";

export default class ValorantMaps {
    private readonly data: IValorantMap[];

    constructor(data: IValorantMap[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find((map) => map.displayName === name);
    }

    getByID(id: string) {
        return this.data.find((map) => map.uuid === id);
    }

    static async fetch() {
        const data = await fetch(`${Valorant.assetsURL}/maps`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantMaps(data);
    }

    embed = (map: IValorantMap) =>
        new EmbedBuilder()
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
                    value: map.callouts
                        .map(
                            (callout) =>
                                `${callout.regionName} - ${callout.superRegionName} (X: ${callout.location.x} - Y: ${callout.location.y})`
                        )
                        .join("\n")
                }
            );
}
