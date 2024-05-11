import Valorant from "../..";

export default class ValorantGear {
    private readonly data: IValorantGear[];

    constructor(data: IValorantGear[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find((gear) => gear.displayName === name);
    }

    getByID(id: string) {
        return this.data.find((gear) => gear.uuid === id);
    }

    static async fetch() {
        const data = await fetch(`${Valorant.assetsURL}/gear`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantGear(data);
    }

    // TODO: Add Embed method
}
