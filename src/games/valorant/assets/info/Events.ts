import logger from "Logger";
import Valorant from "../..";
import { fetch } from "@sapphire/fetch";

export default class ValorantEvents {
    private readonly data: IValorantEvent[];

    constructor(data: IValorantEvent[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (event: string) =>
        this.data.find(
            (e) => e.displayName.toLowerCase() === event.toLowerCase()
        ) ?? this.data.find((e) => e.uuid === event);

    static async init() {
        const data = await fetch<any>(`${Valorant.assetsURL}/events`)
            .then((res) => res.data)
            .catch((err) => {
                logger.error(err);
                return [];
            });

        return new ValorantEvents(data);
    }
}
