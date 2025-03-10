import type Kuramisa from "Kuramisa";
import Music from "./Music";
import SelfRoles from "./selfRoles";

export default class Systems {
    readonly kuramisa: Kuramisa;

    readonly music: Music;
    readonly selfRoles: SelfRoles;

    constructor(kuramisa: Kuramisa) {
        this.kuramisa = kuramisa;

        this.music = new Music(kuramisa);
        this.selfRoles = new SelfRoles();
    }
}
