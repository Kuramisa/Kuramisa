import type Kuramisa from "Kuramisa";
import Music from "./Music";
import SelfRoles from "./selfRoles";
import { Solver } from "@2captcha/captcha-solver";

if (!process.env.TWOCAPTCHA_KEY)
    throw new Error("2Captcha key is not provided");
export default class Systems {
    readonly kuramisa: Kuramisa;

    readonly captcha: Solver;
    readonly music: Music;
    readonly selfRoles: SelfRoles;

    constructor(kuramisa: Kuramisa) {
        this.kuramisa = kuramisa;

        this.captcha = new Solver(process.env.TWOCAPTCHA_KEY ?? "");
        this.music = new Music(kuramisa);
        this.selfRoles = new SelfRoles();
    }
}
