import { fetch } from "@sapphire/fetch";
import logger from "Logger";
import type { ValorantMission } from "typings/Valorant";

import Valorant from "../..";

export default class ValorantMissions {
    private readonly data: ValorantMission[];

    constructor(data: ValorantMission[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (mission: string) =>
        this.data.find(
            (m) => m.displayName.toLowerCase() === mission.toLowerCase(),
        ) ?? this.data.find((m) => m.uuid === mission);

    static async init() {
        const data = await fetch<any>(`${Valorant.assetsURL}/missions`)
            .then((res) => res.data)
            .catch((err) => {
                logger.error(err);
                return [];
            });

        return new ValorantMissions(data);
    }
}
