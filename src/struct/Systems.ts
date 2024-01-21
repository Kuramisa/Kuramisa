import Cryptr from "cryptr";

import OpenAI from "./systems/OpenAI";
import Poll from "./systems/Poll";
import XP from "./systems/XP";
import Music from "./systems/Music";

const { CRYPT_SECRET } = process.env;

export default class KuramisaSystems {
    readonly crypt: Cryptr;
    readonly openai: OpenAI;
    readonly music: Music;
    readonly poll: Poll;
    readonly xp: XP;

    constructor() {
        this.crypt = new Cryptr(CRYPT_SECRET ?? "");
        this.openai = new OpenAI();
        this.music = new Music();
        this.poll = new Poll();
        this.xp = new XP();
    }
}
