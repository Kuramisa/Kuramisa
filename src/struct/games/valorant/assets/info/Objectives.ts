import { Objectives } from "@valapi/valorant-api.com";

export default class ValorantObjectives {
    private readonly data: Objectives.Objectives[];

    constructor(data: Objectives.Objectives[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find(objective => objective.directive === name);
    }

    getByID(id: string) {
        return this.data.find(objective => objective.uuid === id);
    }
}