import logger from "Logger";
import Valorant from "../..";

export default class ValorantSeasons {
    private readonly data: IValorantSeason[];

    constructor(data: IValorantSeason[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get current() {
        return this.data.at(-1);
    }

    get = (season: string) =>
        this.data.find((s) => s.displayName === season) ??
        this.data.find((s) => s.uuid === season);

    static async init() {
        const data = await fetch(`${Valorant.assetsURL}/seasons`)
            .then((res) => res.json())
            .then((res: any) => res.data)
            .catch((err) => {
                logger.error(err);
                return [];
            });

        return new ValorantSeasons(data);
    }
}
