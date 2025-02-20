export default class ValorantAgents {
    private readonly data: IValorantAgent[];

    constructor(data: IValorantAgent[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }
}
