import logger from "Logger";
import Valorant from "../..";
import { fetch } from "@sapphire/fetch";

export default class ValorantLevelBorders {
    private readonly data: IValorantLevelBorder[];

    constructor(data: IValorantLevelBorder[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (level: string | number) =>
        typeof level === "string"
            ? this.data.find((border) => border.uuid === level)
            : this.data.find((border) => border.startingLevel === level);

    static async init() {
        const data = await fetch<any>(`${Valorant.assetsURL}/levelborders`)
            .then((res) => res.data)
            .catch((err) => {
                logger.error(err);
                return [];
            });

        return new ValorantLevelBorders(data);
    }
}
