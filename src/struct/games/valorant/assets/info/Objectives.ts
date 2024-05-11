import Valorant from "../..";

export default class ValorantObjectives {
    private readonly data: IValorantObjective[];

    constructor(data: IValorantObjective[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find((objective) => objective.directive === name);
    }

    getByID(id: string) {
        return this.data.find((objective) => objective.uuid === id);
    }

    static async fetch() {
        const data = await fetch(`${Valorant.assetsURL}/objectives`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantObjectives(data);
    }
}
