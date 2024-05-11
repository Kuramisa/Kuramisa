import Valorant from "../..";

export default class ValorantContracts {
    private readonly data: IValorantContract[];

    constructor(data: IValorantContract[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find((contract) => contract.displayName === name);
    }

    getByID(id: string) {
        return this.data.find((contract) => contract.uuid === id);
    }

    static async fetch() {
        const data = await fetch(`${Valorant.assetsURL}/contracts`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantContracts(data);
    }
}
