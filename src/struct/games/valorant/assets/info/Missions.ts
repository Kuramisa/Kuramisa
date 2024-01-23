import Valorant from "../..";

export default class ValorantMissions {
    private readonly data: IValorantMission[];

    constructor(data: IValorantMission[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find((mission) => mission.displayName === name);
    }

    getByID(id: string) {
        return this.data.find((mission) => mission.uuid === id);
    }

    static async fetch() {
        const data = await fetch(`${Valorant.assetsURL}/missions`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantMissions(data);
    }
}
