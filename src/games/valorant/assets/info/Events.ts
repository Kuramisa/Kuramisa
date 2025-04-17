import type { APIValorantEvent } from "typings/APIValorant";

import { fetch } from "games/valorant/API";

export default class ValorantEvents {
    private readonly data: APIValorantEvent[];

    constructor(data: APIValorantEvent[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (event: string) =>
        this.data.find(
            (e) => e.displayName.toLowerCase() === event.toLowerCase(),
        ) ?? this.data.find((e) => e.uuid === event);

    static readonly init = async () =>
        new ValorantEvents(await fetch("events"));
}
