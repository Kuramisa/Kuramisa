import { Bundles } from "@valapi/valorant-api.com";

export default class ValorantBundles {
    private readonly data: Bundles.Bundles<"en-US">[];

    constructor(data: Bundles.Bundles<"en-US">[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find(bundle => bundle.displayName === name);
    }

    getByID(id: string) {
        return this.data.find(bundle => bundle.uuid === id);
    }

    // TODO: Add Embed method
}