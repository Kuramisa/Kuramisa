import Valorant from "../..";

export default class ValorantVersion {
    private readonly data: IValorantVersion;

    constructor(data: IValorantVersion) {
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

    get riotClient() {
        return this.data.riotClientVersion;
    }

    get riotBuild() {
        return this.data.riotClientBuild;
    }

    get buildDate() {
        return this.data.buildDate;
    }

    static async fetch() {
        const data = await fetch(`${Valorant.assetsURL}/version`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantVersion(data);
    }
}
