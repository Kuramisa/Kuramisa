import Valorant from "../..";

export default class ValorantObjectives {
    private readonly data: IValorantObjective[];

    constructor(data: IValorantObjective[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (objective: string) =>
        this.data.find(
            (o) => o.directive.toLowerCase() === objective.toLowerCase()
        ) ?? this.data.find((o) => o.uuid === objective);

    static async init() {
        const data = await fetch(`${Valorant.assetsURL}/objectives`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantObjectives(data);
    }
}
