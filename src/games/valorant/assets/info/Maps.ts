import { Embed } from "Builders";
import type { APIValorantMap } from "typings/APIValorant";

import { fetch } from "games/valorant/API";

export default class ValorantMaps {
    private readonly data: APIValorantMap[];

    constructor(data: APIValorantMap[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (map: string) =>
        this.data.find(
            (m) => m.displayName.toLowerCase() === map.toLowerCase(),
        ) ?? this.data.find((m) => m.uuid === map);

    static async init() {
        return new ValorantMaps(await fetch("maps"));
    }

    embed = (map: APIValorantMap) =>
        new Embed()
            .setAuthor({
                name: map.displayName,
                iconURL: map.displayIcon,
            })
            .setTitle(`${map.displayName} - ${map.coordinates}`)
            .setDescription(map.narrativeDescription)
            .setImage(map.splash)
            .setThumbnail(map.listViewIcon)
            .addFields(
                {
                    name: "Tactical Description",
                    value: map.tacticalDescription,
                },
                {
                    name: "Callouts",
                    value: map.callouts
                        .map(
                            (callout) =>
                                `${callout.regionName} - ${callout.superRegionName} (X: ${callout.location.x} - Y: ${callout.location.y})`,
                        )
                        .join("\n"),
                },
            );
}
