import { Embed } from "@builders";
import Valorant from "../..";
import logger from "Logger";

export default class ValorantMaps {
    private readonly data: IValorantMap[];

    constructor(data: IValorantMap[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (map: string) =>
        this.data.find(
            (m) => m.displayName.toLowerCase() === map.toLowerCase()
        ) ?? this.data.find((m) => m.uuid === map);

    static async init() {
        const data = await fetch(`${Valorant.assetsURL}/maps`)
            .then((res) => res.json())
            .then((res: any) => res.data)
            .catch((err) => {
                logger.error(err);
                return [];
            });

        return new ValorantMaps(data);
    }

    embed = (map: IValorantMap) =>
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
                                `${callout.regionName} - ${callout.superRegionName} (X: ${callout.location.x} - Y: ${callout.location.y})`
                        )
                        .join("\n"),
                }
            );
}
