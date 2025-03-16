import logger from "Logger";
import Valorant from "../..";

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
        const data = await fetch(`${Valorant.assetsURL}/contracts`)
            .then((res) => res.json())
            .then((res: any) => res.data)
            .catch((err) => {
                logger.error(err);
                return [];
            });

        return new ValorantContracts(data);
    }
}
