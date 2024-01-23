import Valorant from "../..";

export default class ValorantSprays {
    private readonly data: IValorantSpray[];

    constructor(data: IValorantSpray[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find((spray) => spray.displayName === name);
    }

    getByID(id: string) {
        return this.data.find((spray) => spray.uuid === id);
    }

    // TODO: Add Embed method

    static async fetch() {
        const data = await fetch(`${Valorant.assetsURL}/sprays`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantSprays(data);
    }
}
