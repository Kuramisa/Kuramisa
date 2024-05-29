import { Canvas, GlobalFonts } from "@napi-rs/canvas";
import path from "path";
import fs from "fs/promises";
import axios from "axios";
import getColors from "get-image-colors";
import { Font } from "canvacord";

import KanvasImages from "./Images";
import KanvasMember from "./Member";
import KanvasModify from "./Modify";

import logger from "@struct/Logger";
import { startCase } from "lodash";
import { randEl } from "@utils";

const fontsDir = path.resolve(`${process.cwd()}/assets/fonts`);

GlobalFonts.registerFromPath(
    `${fontsDir}/Poppins/Poppins-Regular.ttf`,
    "Poppins"
);
GlobalFonts.registerFromPath(
    `${fontsDir}/Poppins/Poppins-Bold.ttf`,
    "Poppins Bold"
);
GlobalFonts.registerFromPath(
    `${fontsDir}/Manrope/Manrope-Regular.ttf`,
    "Manrope"
);
GlobalFonts.registerFromPath(
    `${fontsDir}/Manrope/Manrope-Bold.ttf`,
    "Manrope Bold"
);
GlobalFonts.registerFromPath(`${fontsDir}/Others/Abyss.ttf`, "Abyss");

export default class Kanvas {
    readonly images: KanvasImages;
    readonly member: KanvasMember;
    readonly modify: KanvasModify;

    constructor() {
        this.images = new KanvasImages(this);
        this.member = new KanvasMember(this);
        this.modify = new KanvasModify();

        this.loadFonts();
    }

    async loadFonts() {
        logger.info("[Fonts] Loading fonts...");

        const fontsDir = path.resolve(`${process.cwd()}/assets/fonts`);

        for (const fontDir of await fs.readdir(fontsDir)) {
            const fonts = path.resolve(
                `${process.cwd()}/assets/fonts/${fontDir}`
            );

            for (const font of await fs.readdir(fonts)) {
                const fontName = startCase(font.split(".")[0]);

                await Font.fromFile(`${fontsDir}/${fontDir}/${font}`, fontName);
                logger.debug(`[Fonts] Loaded ${fontName}`);
            }
        }

        logger.info("[Fonts] Fonts loaded!");
    }

    makeBackground(color: string, w = 1024, h = 450) {
        const canvas = new Canvas(w, h);
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        return canvas.toBuffer("image/png");
    }

    applyText(
        canvas: Canvas,
        text: string,
        defaultFontSize: number,
        width: number,
        font: string
    ) {
        const ctx = canvas.getContext("2d");
        do {
            ctx.font = `${(defaultFontSize -= 1)}px ${font}`;
        } while (ctx.measureText(text).width > width);
        return ctx.font;
    }

    async popularColors(url?: string | null) {
        if (!url) return null;
        const buffer = await axios
            .get(url, {
                responseType: "arraybuffer"
            })
            .then((res) => res.data)
            .catch(() => null);

        if (!buffer) return null;

        return (await getColors(buffer, "image/png")).map((color: any) =>
            color.hex()
        );
    }

    async popularColor(url?: string | null) {
        if (!url) return null;
        const colors = await this.popularColors(url);
        if (!colors) return null;
        return randEl(colors);
    }

    invertColor(hex?: string) {
        if (!hex) return "#FFFFFF";
        hex = hex.replace("#", "");

        // match hex color
        if (hex.length === 3)
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        if (hex.length !== 6) return "#FFFFFF";

        // invert colors
        const r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16);
        const g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16);
        const b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);

        // return new hex
        const pad = (txt: string, length?: number) => {
            length = length ?? 2;
            const arr = [length].join("0");
            return (arr + txt).slice(-length);
        };

        return `#${pad(r)}${pad(g)}${pad(b)}`;
    }
}
