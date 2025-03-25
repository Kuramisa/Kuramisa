import { Solver } from "@2captcha/captcha-solver";
import type Kuramisa from "Kuramisa";

import Music from "./Music";
import SelfRoles from "./selfRoles";

if (!process.env.TWOCAPTCHA_KEY)
    throw new Error("2Captcha key is not provided");
export default class Systems {
    readonly captcha: Solver;
    readonly music: Music;
    readonly selfRoles: SelfRoles;

    constructor(client: Kuramisa) {
        this.captcha = new Solver(process.env.TWOCAPTCHA_KEY ?? "");
        this.music = new Music(client);
        this.selfRoles = new SelfRoles();
    }
}
