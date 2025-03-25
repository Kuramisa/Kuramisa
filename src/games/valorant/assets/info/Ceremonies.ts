import { fetch } from "@sapphire/fetch";
import logger from "Logger";
import type { ValorantCeremony } from "typings/Valorant";

import Valorant from "../..";

export default class ValorantCeremonies {
    private readonly data: ValorantCeremony[];

    constructor(data: ValorantCeremony[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (ceremony: string) =>
        this.data.find(
            (c) => c.displayName.toLowerCase() === ceremony.toLowerCase(),
        ) ?? this.data.find((c) => c.uuid === ceremony);

    static async init() {
        const data = await fetch<any>(`${Valorant.assetsURL}/ceremonies`)
            .then((res) => res.data)
            .catch((err) => {
                logger.error(err);
                return [];
            });

        return new ValorantCeremonies(data);
    }
}
