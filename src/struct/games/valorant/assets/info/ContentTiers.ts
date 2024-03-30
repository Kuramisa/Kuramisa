import Valorant from "../..";

export default class ValorantContentTiers {
    private readonly data: IValorantContentTier[];

    constructor(data: IValorantContentTier[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get byName() {
        return this.data.reduce(
            (obj, tier) => {
                obj[tier.displayName] = tier;
                return obj;
            },
            {} as Record<string, IValorantContentTier>
        );
    }

    get(name: string) {
        return this.data.find((tier) => tier.displayName === name);
    }

    getByID(id: string) {
        return this.data.find((tier) => tier.uuid === id);
    }

    static async fetch() {
        const data = await fetch(`${Valorant.assetsURL}/contenttiers`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantContentTiers(data);
    }
}
