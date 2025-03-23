import logger from "Logger";
import Valorant from "../..";
import { fetch } from "@sapphire/fetch";

export default class ValorantCeremonies {
    private readonly data: IValorantCeremony[];

    constructor(data: IValorantCeremony[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (ceremony: string) =>
        this.data.find(
            (c) => c.displayName.toLowerCase() === ceremony.toLowerCase()
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
