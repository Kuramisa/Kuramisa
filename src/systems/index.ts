import { Solver } from "@2captcha/captcha-solver";
import type Kuramisa from "Kuramisa";

import { ElevenLabsClient } from "elevenlabs";
import logger from "Logger";
import Music from "./Music";
import SelfRoles from "./selfRoles";

if (!process.env.TWOCAPTCHA_KEY) {
    logger.error("2Captcha key is not provided");
    process.exit(1);
}

if (!process.env.ELEVENLABS_KEY) {
    logger.error("ElevenLabs key is not provided");
    process.exit(1);
}

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
