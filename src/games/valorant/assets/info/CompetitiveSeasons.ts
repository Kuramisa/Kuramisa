import { fetch } from "@sapphire/fetch";
import logger from "Logger";
import type { ValorantCompetitiveSeason } from "typings/Valorant";

import Valorant from "../..";

export default class ValorantCompetitiveSeasons {
    private readonly data: ValorantCompetitiveSeason[];

    constructor(data: ValorantCompetitiveSeason[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get current() {
        return this.data.at(-1);
    }

    get = (season: string) =>
        this.data.find((s) => s.seasonUuid === season) ??
        this.data.find((s) => s.uuid === season);

    static async init() {
        const data = await fetch<any>(
            `${Valorant.assetsURL}/seasons/competitive`,
        )
            .then((res) => res.data)
            .catch((err) => {
                logger.error(err);
                return [];
            });

        return new ValorantCompetitiveSeasons(data);
    }
}
