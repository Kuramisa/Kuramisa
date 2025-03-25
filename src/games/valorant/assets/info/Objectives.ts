import { fetch } from "@sapphire/fetch";
import logger from "Logger";
import type { ValorantObjective } from "typings/Valorant";

import Valorant from "../..";

export default class ValorantObjectives {
    private readonly data: ValorantObjective[];

    constructor(data: ValorantObjective[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (objective: string) =>
        this.data.find(
            (o) => o.directive.toLowerCase() === objective.toLowerCase(),
        ) ?? this.data.find((o) => o.uuid === objective);

    static async init() {
        const data = await fetch<any>(`${Valorant.assetsURL}/objectives`)
            .then((res) => res.data)
            .catch((err) => {
                logger.error(err);
                return [];
            });

        return new ValorantObjectives(data);
    }
}
