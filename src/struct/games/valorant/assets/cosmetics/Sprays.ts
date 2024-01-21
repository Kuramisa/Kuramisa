import { Sprays } from "@valapi/valorant-api.com";

export default class ValorantSprays {
    private readonly data: Sprays.Sprays<"en-US">[];

    constructor(data: Sprays.Sprays<"en-US">[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find(spray => spray.displayName === name);
    }

    getByID(id: string) {
        return this.data.find(spray => spray.uuid === id);
    }

    // TODO: Add Embed method
}