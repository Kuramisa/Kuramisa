import logger from "Logger";
import Valorant from "../..";
import { fetch } from "@sapphire/fetch";

export default class ValorantContracts {
    private readonly data: IValorantContract[];

    constructor(data: IValorantContract[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (contract: string) =>
        this.data.find(
            (c) => c.displayName.toLowerCase() === contract.toLowerCase()
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
