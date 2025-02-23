import Valorant from "../..";

export default class ValorantEvents {
    private readonly data: IValorantEvent[];

    constructor(data: IValorantEvent[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (event: string) =>
        this.data.find(
            (e) => e.displayName.toLowerCase() === event.toLowerCase()
        ) ?? this.data.find((e) => e.uuid === event);

    static async init() {
        const data = await fetch(`${Valorant.assetsURL}/events`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantEvents(data);
    }
}
