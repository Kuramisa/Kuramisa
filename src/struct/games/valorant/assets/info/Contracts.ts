import { Contracts } from "@valapi/valorant-api.com";

export default class ValorantContracts {
    private readonly data: Contracts.Contracts<"en-US">[];

    constructor(data: Contracts.Contracts<"en-US">[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find(contract => contract.displayName === name);
    }

    getByID(id: string) {
        return this.data.find(contract => contract.uuid === id);
    }
}