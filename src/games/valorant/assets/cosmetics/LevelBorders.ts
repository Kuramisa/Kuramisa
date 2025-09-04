import { fetch } from "@games/valorant/API";
import type { APIValorantLevelBorder } from "@typings/APIValorant";

export default class ValorantLevelBorders {
    private readonly data: APIValorantLevelBorder[];

    constructor(data: APIValorantLevelBorder[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (level: string | number) =>
        typeof level === "string"
            ? this.data.find((border) => border.uuid === level)
            : this.data.find((border) => border.startingLevel === level);

    static readonly init = async () =>
        new ValorantLevelBorders(await fetch("levelborders"));
}
