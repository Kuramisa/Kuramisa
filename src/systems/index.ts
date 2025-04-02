import { Solver } from "@2captcha/captcha-solver";
import type Kuramisa from "Kuramisa";

import { ElevenLabsClient } from "elevenlabs";
import Music from "./Music";
import SelfRoles from "./selfRoles";

export default class Systems {
    readonly captcha: Solver;
    readonly elevenlabs: ElevenLabsClient;
    readonly music: Music;
    readonly selfRoles: SelfRoles;

    constructor(client: Kuramisa) {
        this.captcha = new Solver(process.env.TWOCAPTCHA_KEY ?? "");
        this.elevenlabs = new ElevenLabsClient({
            apiKey: process.env.ELEVENLABS_KEY ?? "",
        });
        this.music = new Music(client);
        this.selfRoles = new SelfRoles();
    }
}
