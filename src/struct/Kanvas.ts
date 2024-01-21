import { Canvas, GlobalFonts } from "@napi-rs/canvas";
import axios from "axios";
import getColors from "get-image-colors";
import KanvasMember from "./kanvas/Member";
import KanvasImages from "./kanvas/Images";
import KanvasModify from "./kanvas/Modify";
import KanvasUtil from "./kanvas/Util";

const fontsDir = `${process.cwd()}/assets/fonts`;

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
GlobalFonts.registerFromPath(
    `${fontsDir}/Others/AbyssinicaSIL-Regular.ttf`,
    "Abyss"
);

export default class Kanvas {
    readonly member: KanvasMember;
    readonly images: KanvasImages;
    readonly modify: KanvasModify;
    readonly util: KanvasUtil;

    constructor() {
        this.member = new KanvasMember(this);
        this.images = new KanvasImages(this);
        this.modify = new KanvasModify();
        this.util = new KanvasUtil();
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

    async popularColor(url?: string | null) {
        if (!url) return null;
        const buffer = await axios
            .get(url, {
                responseType: "arraybuffer",
            })
            .then((res) => res.data)
            .catch(() => null);

        if (!buffer) return null;

        return (await getColors(buffer, "image/png")).map((color: any) =>
            color.hex()
        );
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
            length = length || 2;
            const arr = [length].join("0");
            return (arr + txt).slice(-length);
        };

        return `#${pad(r)}${pad(g)}${pad(b)}`;
    }
}
