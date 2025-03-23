import logger from "Logger";
import Valorant from "../..";
import { fetch } from "@sapphire/fetch";

export default class ValorantObjectives {
    private readonly data: IValorantObjective[];

    constructor(data: IValorantObjective[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (objective: string) =>
        this.data.find(
            (o) => o.directive.toLowerCase() === objective.toLowerCase()
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
