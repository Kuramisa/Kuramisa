import Valorant from "../..";

export default class ValorantPlayerTitles {
    private readonly data: IValorantPlayerTitle[];

    constructor(data: IValorantPlayerTitle[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find(
            (playerTitle) => playerTitle.displayName === name
        );
    }

    getByID(id: string) {
        return this.data.find((playerTitle) => playerTitle.uuid === id);
    }

    // TODO: Add Embed method

    static async fetch() {
        const data = await fetch(`${Valorant.assetsURL}/playertitles`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantPlayerTitles(data);
    }
}
