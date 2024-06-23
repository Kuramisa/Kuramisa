import Cryptr from "cryptr";

import OpenAI from "./OpenAI";
import Music from "./Music";
import Kuramisa from "Kuramisa";

const { CRYPT_SECRET } = process.env;

export default class KSystems {
    readonly crypt: Cryptr;
    readonly openai: OpenAI;
    readonly music: Music;

    constructor(kuramisa: Kuramisa) {
        this.crypt = new Cryptr(CRYPT_SECRET ?? "");
        this.openai = new OpenAI();
        this.music = new Music(kuramisa);
    }
}
