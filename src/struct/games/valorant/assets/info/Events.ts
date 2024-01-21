import { Events } from "@valapi/valorant-api.com";

export default class ValorantEvents {
    private readonly data: Events.Events<"en-US">[];

    constructor(data: Events.Events<"en-US">[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find(event => event.displayName === name);
    }

    getByID(id: string) {
        return this.data.find(event => event.uuid === id);
    }
}