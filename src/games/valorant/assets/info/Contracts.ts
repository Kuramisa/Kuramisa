import { fetch } from "@sapphire/fetch";
import logger from "Logger";
import type { ValorantContract } from "typings/Valorant";

import Valorant from "../..";

export default class ValorantContracts {
    private readonly data: ValorantContract[];

    constructor(data: ValorantContract[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (contract: string) =>
        this.data.find(
            (c) => c.displayName.toLowerCase() === contract.toLowerCase(),
        ) ?? this.data.find((c) => c.uuid === contract);

    static async init() {
        const data = await fetch<any>(`${Valorant.assetsURL}/contracts`)
            .then((res) => res.data)
            .catch((err) => {
                logger.error(err);
                return [];
            });

        return new ValorantContracts(data);
    }
}
