import { ContentTiers } from "@valapi/valorant-api.com";

export default class ValorantContentTiers {
    private readonly data: ContentTiers.ContentTiers<"en-US">[];

    constructor(data: ContentTiers.ContentTiers<"en-US">[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get byName() {
        return this.data.reduce((obj, tier) => {
            obj[tier.displayName] = tier;
            return obj;
        }, {} as Record<string, ContentTiers.ContentTiers<"en-US">>);
    }

    get(name: string) {
        return this.data.find(tier => tier.displayName === name);
    }

    getByID(id: string) {
        return this.data.find(tier => tier.uuid === id);
    }
}