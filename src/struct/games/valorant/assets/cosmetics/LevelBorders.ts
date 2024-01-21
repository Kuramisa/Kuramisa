import { LevelBorders } from "@valapi/valorant-api.com";

export default class ValorantLevelBorders {
    private readonly data: LevelBorders.LevelBorders[];

    constructor(data: LevelBorders.LevelBorders[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(startingLevel: number) {
        return this.data.find(border => border.startingLevel === startingLevel);
    }

    getByID(id: string) {
        return this.data.find(border => border.uuid === id);
    }
}