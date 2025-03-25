import { fetch } from "@sapphire/fetch";
import Valorant from "games/valorant";
import logger from "Logger";
import type { ValorantVersion } from "typings/Valorant";

export default class ValorantVersions {
    private readonly data: ValorantVersion;

    constructor(data: ValorantVersion) {
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
        return this.data.buildDate;
    }

    static async init() {
        const data = await fetch<any>(`${Valorant.assetsURL}/version`)
            .then((res) => res.data)
            .catch((err) => {
                logger.error(err);
                return {
                    manifestId: "",
                    branch: "",
                    version: "",
                    buildVersion: "",
                    engineVersion: "",
                    riotClientVersion: "",
                    riotClientBuild: "",
                    buildDate: "",
                };
            });

        return new ValorantVersions(data);
    }
}
