import Valorant from "../..";

export default class ValorantBundles {
    private readonly data: IValorantBundle[];

    constructor(data: IValorantBundle[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find((bundle) => bundle.displayName === name);
    }

    getByID(id: string) {
        return this.data.find((bundle) => bundle.uuid === id);
    }

    // TODO: Add Embed method

    static async fetch() {
        const data = await fetch(`${Valorant.assetsURL}/bundles`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantBundles(data);
    }
}
