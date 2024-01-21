import { Missions } from "@valapi/valorant-api.com";

export default class ValorantMissions {
    private readonly data: Missions.Missions[];

    constructor(data: Missions.Missions[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find(mission => mission.displayName === name);
    }

    getByID(id: string) {
        return this.data.find(mission => mission.uuid === id);
    }
}