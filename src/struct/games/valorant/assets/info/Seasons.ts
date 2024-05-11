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

    get(name: string) {
        return this.data.find((season) => season.displayName === name);
    }

    getByID(id: string) {
        return this.data.find((season) => season.uuid === id);
    }

    static async fetch() {
        const data = await fetch(`${Valorant.assetsURL}/seasons`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantSeasons(data);
    }

    // TODO: Add Embed method
}
