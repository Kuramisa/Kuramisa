import { fetch } from "@sapphire/fetch";
import { Embed } from "Builders";
import logger from "Logger";
import type { ValorantMap } from "typings/Valorant";

import Valorant from "../..";

export default class ValorantMaps {
    private readonly data: ValorantMap[];

    constructor(data: ValorantMap[]) {
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
        const data = await fetch<any>(`${Valorant.assetsURL}/maps`)
            .then((res) => res.data)
            .catch((err) => {
                logger.error(err);
                return [];
            });

        return new ValorantMaps(data);
    }

    embed = (map: ValorantMap) =>
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
