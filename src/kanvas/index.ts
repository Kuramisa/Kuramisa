import axios from "axios";
import getColors from "get-image-colors";
import { randEl } from "utils";

export default class Kanvas {
    async popularColors(url?: string | null) {
        if (!url) return ["#FFF"];
        const buffer = await axios
            .get(url, {
                responseType: "arraybuffer",
            })
            .then((res) => res.data)
            .catch(() => null);

        if (!buffer) return ["#FFF"];

        return (await getColors(buffer, "image/png")).map((color: any) =>
            color.hex()
        );
    }

    async popularColor(url?: string | null) {
        if (!url) return "#FFF";
        const colors = await this.popularColors(url);
        if (!colors) return "#FFF";
        return randEl(colors);
    }

    invertColor(hex?: string) {
        if (!hex) return "#FFF";
        hex = hex.replace("#", "");

        // match hex color
        if (hex.length === 3)
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        if (hex.length !== 6) return "#FFF";

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
