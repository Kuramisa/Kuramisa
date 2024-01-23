import Valorant from "../..";

export default class ValorantLevelBorders {
    private readonly data: IValorantLevelBorder[];

    constructor(data: IValorantLevelBorder[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(startingLevel: number) {
        return this.data.find(
            (border) => border.startingLevel === startingLevel
        );
    }

    getByID(id: string) {
        return this.data.find((border) => border.uuid === id);
    }

    static async fetch() {
        const data = await fetch(`${Valorant.assetsURL}/levelborders`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantLevelBorders(data);
    }
}
