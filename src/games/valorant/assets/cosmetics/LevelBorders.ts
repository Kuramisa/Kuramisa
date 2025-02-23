import Valorant from "../..";

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
        const data = await fetch(`${Valorant.assetsURL}/levelborders`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantLevelBorders(data);
    }
}
