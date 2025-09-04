import { Solver } from "@2captcha/captcha-solver";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type Kuramisa from "@kuramisa";
import Music from "./Music";
import SelfRoles from "./self-roles";

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
