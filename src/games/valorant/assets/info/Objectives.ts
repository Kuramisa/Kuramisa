import { fetch } from "games/valorant/API";
import type { APIValorantObjective } from "typings/APIValorant";

export default class ValorantObjectives {
    private readonly data: APIValorantObjective[];

    constructor(data: APIValorantObjective[]) {
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
        return new ValorantObjectives(await fetch("objectives"));
    }
}
