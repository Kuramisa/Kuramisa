import type { APIValorantMission } from "typings/APIValorant";

import { fetch } from "games/valorant/API";

export default class ValorantMissions {
    private readonly data: APIValorantMission[];

    constructor(data: APIValorantMission[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (mission: string) =>
        this.data.find(
            (m) => m.displayName.toLowerCase() === mission.toLowerCase(),
        ) ?? this.data.find((m) => m.uuid === mission);

    static readonly init = async () =>
        new ValorantMissions(await fetch("missions"));
}
