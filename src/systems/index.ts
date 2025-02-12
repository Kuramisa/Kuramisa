import type Kuramisa from "Kuramisa";
import Music from "./Music";

export default class Systems {
    readonly kuramisa: Kuramisa;

    readonly music: Music;

    constructor(kuramisa: Kuramisa) {
        this.kuramisa = kuramisa;

        this.music = new Music(kuramisa);
    }
}
