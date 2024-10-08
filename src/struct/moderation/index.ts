import kuramisa from "@kuramisa";

import SelfRoles from "./SelfRoles";
import Warns from "./Warns";

import SightEngine from "sightengine";
import type { Message } from "discord.js";
import { capitalize } from "lodash";
import { conj } from "@utils";
import logger from "@struct/Logger";

const { SIGHTENGINE_ID, SIGHTENGINE_API } = process.env;

const sightengine = new SightEngine(SIGHTENGINE_ID, SIGHTENGINE_API);

export default class KModeration {
    readonly selfRoles: SelfRoles;
    readonly warns: Warns;

    constructor() {
        this.selfRoles = new SelfRoles();
        this.warns = new Warns();
    }

    async image(url: string) {
        const reasons = [];

        try {
            const data = await sightengine
                .check([
                    "nudity-2.0",
                    "offensive",
                    "scam",
                    "text-content",
                    "gore",
                    "qr-content",
                    "self-harm"
                ])
                .set_url(url);

            const { nudity, offensive, scam, gore, text } = data;

            for (let i = 0; i < Object.keys(nudity).length; i++) {
                const key = Object.keys(nudity)[i];
                const value = Object.values(nudity)[i] as number;
                if (value >= 0.2) {
                    switch (key) {
                        case "sexual_activity":
                            reasons.push("Sexual Activity");
                            break;
                        case "sexual_display":
                            reasons.push("Sexual Display");
                            break;
                        case "erotica":
                            reasons.push("Erotica");
                            break;
                        case "suggestive":
                            reasons.push("Suggestive Content");
                            break;
                    }
                }
            }

            for (let i = 0; i < Object.keys(offensive).length; i++) {
                const key = Object.keys(offensive)[i];
                const value = Object.values(offensive)[i] as number;
                if (value >= 0.2) {
                    switch (key) {
                        case "nazi":
                            reasons.push("Nazism");
                            break;
                        case "confederate":
                            reasons.push("Confederatism");
                            break;
                        case "supremacist":
                            reasons.push("Supremacy");
                            break;
                        case "terrorist":
                            reasons.push("Terrorism");
                            break;
                    }
                }
            }

            if (scam.prob > 0.25) reasons.push("Scam");
            if (gore.prob > 0.25) reasons.push("Gore");

            for (let i = 0; i < Object.keys(text).length; i++) {
                const value = Object.values(text)[i] as boolean | any[];
                if (typeof value === "boolean") continue;
                for (let j = 0; j < value.length; j++) {
                    const detected = value[j];
                    reasons.push(capitalize(detected.type));
                }
            }
        } catch (err) {
            logger.error(err);
        }

        return reasons;
    }
    async video(url: string) {
        const { data } = await sightengine
            .check([
                "nudity-2.0",
                "offensive",
                "scam",
                "text-content",
                "gore",
                "qr-content"
            ])
            .video_sync(url);

        const reasons: string[] = [];
        if (!data) return reasons;

        const { frames } = data;
        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];
            const { nudity, offensive, scam, gore, text } = frame;
            for (let i = 0; i < Object.keys(nudity).length; i++) {
                const key = Object.keys(nudity)[i];
                const value = Object.values(nudity)[i] as number;
                if (value >= 0.2) {
                    switch (key) {
                        case "sexual_activity":
                            reasons.push("Sexual Activity");
                            break;
                        case "sexual_display":
                            reasons.push("Sexual Display");
                            break;
                        case "erotica":
                            reasons.push("Erotica");
                            break;
                        case "suggestive":
                            reasons.push("Suggestive Content");
                            break;
                    }
                }
            }

            for (let i = 0; i < Object.keys(offensive).length; i++) {
                const key = Object.keys(offensive)[i];
                const value = Object.values(offensive)[i] as number;
                if (value >= 0.2) {
                    switch (key) {
                        case "nazi":
                            reasons.push("Nazism");
                            break;
                        case "confederate":
                            reasons.push("Confederatism");
                            break;
                        case "supremacist":
                            reasons.push("Supremacy");
                            break;
                        case "terrorist":
                            reasons.push("Terrorism");
                            break;
                    }
                }
            }

            if (scam.prob > 0.25) reasons.push("Scam");
            if (gore.prob > 0.25) reasons.push("Gore");

            for (let i = 0; i < Object.keys(text).length; i++) {
                const value = Object.values(text)[i] as boolean | any[];
                if (typeof value === "boolean") continue;
                for (let j = 0; j < value.length; j++) {
                    const detected = value[j];
                    reasons.push(capitalize(detected.type));
                }
            }
        }

        return reasons;
    }

    async text(text: string) {
        const {
            systems: { openai }
        } = kuramisa;

        const completion = await openai.moderations.create({
            model: "text-moderation-latest",
            input: text.trim()
        });

        const response = completion.results[0];

        if (!response.flagged) return null;

        const { categories } = response;
        const reasons: string[] = [];

        for (let i = 0; i < Object.keys(categories).length; i++) {
            const flagName = Object.keys(categories)[i];
            const isFlagged = Object.values(categories)[i];
            if (isFlagged) {
                switch (flagName) {
                    case "sexual":
                        if (!reasons.includes("Sexual Content towards Minors"))
                            reasons.push("Sexual Content");
                        break;
                    case "hate":
                        reasons.push("Hate Speech");
                        break;
                    case "violence":
                        reasons.push("Violence");
                        break;
                    case "violence/graphic":
                        reasons.push("Graphic Content");
                        break;
                    case "hate/threatening":
                        reasons.push("Threats");
                        break;
                    case "sexual/minors":
                        reasons.push("Sexual Content towards Minors");
                        break;
                    case "self-harm":
                        reasons.push("Self-Harm");
                        break;
                }
            }
        }

        return reasons;
    }

    async moderate(message: Message) {
        if (message.author.id === kuramisa.user?.id) return;
        if (!message.guild) return;
        if (message.channel.isDMBased()) return;

        const {
            managers,
            systems: { openai }
        } = kuramisa;
        const { guild } = message;

        const db = await managers.guilds.get(guild.id);
        if (!db.filters.message.enabled) return;

        if (message.author.id === kuramisa.user?.id) return;

        try {
            const reasons = await this.text(message.content);
            if (!reasons) return;

            await message.delete();
            message.channel.send({
                content: `**${message.author}, your message was deleted because it contained: \`${conj(reasons)}\`**`
            });
        } catch (error: any) {
            openai.throwError(error, message.content);
        }
    }
}
