import Valorant from "../..";

export default class ValorantCeremonies {
    private readonly data: IValorantCeremony[];

    constructor(data: IValorantCeremony[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (name: string) =>
        this.data.find((ceremony) => ceremony.displayName === name);
    getByID = (id: string) =>
        this.data.find((ceremony) => ceremony.uuid === id);

    static async fetch() {
        const data = await fetch(`${Valorant.assetsURL}/ceremonies`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantCeremonies(data);
    }
}
