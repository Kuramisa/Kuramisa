import Valorant from "../..";

export default class ValorantCompetitiveSeasons {
    private readonly data: IValorantCompetitiveSeason[];

    constructor(data: IValorantCompetitiveSeason[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get current() {
        return this.data.at(-1);
    }

    get = (id: string) =>
        this.data.find(
            (season) => season.uuid === id || season.seasonUuid === id
        );

    static async fetch() {
        const data = await fetch(`${Valorant.assetsURL}/seasons/competitive`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantCompetitiveSeasons(data);
    }
}
