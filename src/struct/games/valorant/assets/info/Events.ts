import Valorant from "../..";

export default class ValorantEvents {
    private readonly data: IValorantEvent[];

    constructor(data: IValorantEvent[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find((event) => event.displayName === name);
    }

    getByID(id: string) {
        return this.data.find((event) => event.uuid === id);
    }

    static async fetch() {
        const data = await fetch(`${Valorant.assetsURL}/events`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantEvents(data);
    }
}
