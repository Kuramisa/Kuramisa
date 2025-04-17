import { fetch } from "games/valorant/API";
import type { APIValorantVersion } from "typings/APIValorant";

export default class ValorantVersions {
    private readonly data: APIValorantVersion;

    constructor(data: APIValorantVersion) {
        this.data = data;
    }

    get manifest() {
        return this.data.manifestId;
    }

    get branch() {
        return this.data.branch;
    }

    get version() {
        return this.data.version;
    }

    get build() {
        return this.data.buildVersion;
    }

    get engine() {
        return this.data.engineVersion;
    }

    get riotVersion() {
        return this.data.riotClientVersion;
    }

    get riotBuild() {
        return this.data.riotClientBuild;
    }

    get buildDate() {
        return new Date(this.data.buildDate);
    }

    get buildDateTimestamp() {
        return new Date(this.data.buildDate).getTime();
    }

    static readonly init = async () =>
        new ValorantVersions(await fetch("version"));
}
