import { Gear } from "@valapi/valorant-api.com";

export default class ValorantGear {
    private readonly data: Gear.Gear<"en-US">[];

    constructor(data: Gear.Gear<"en-US">[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find(gear => gear.displayName === name);
    }

    getByID(id: string) {
        return this.data.find(gear => gear.uuid === id);
    }

    // TODO: Add Embed method
}