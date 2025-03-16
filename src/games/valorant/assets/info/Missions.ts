import logger from "Logger";
import Valorant from "../..";

export default class ValorantMissions {
    private readonly data: IValorantMission[];

    constructor(data: IValorantMission[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (mission: string) =>
        this.data.find(
            (m) => m.displayName.toLowerCase() === mission.toLowerCase()
        ) ?? this.data.find((m) => m.uuid === mission);

    static async init() {
        const data = await fetch(`${Valorant.assetsURL}/missions`)
            .then((res) => res.json())
            .then((res: any) => res.data)
            .catch((err) => {
                logger.error(err);
                return [];
            });

        return new ValorantMissions(data);
    }
}
