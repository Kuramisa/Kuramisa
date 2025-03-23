import { pickRandom } from "@sapphire/utilities";

import { HexColorString } from "discord.js";
import { fetch, FetchResultTypes } from "@sapphire/fetch";
import getColors from "get-image-colors";

export default class Kanvas {
    async popularColors(url?: string | null): Promise<HexColorString[]> {
        if (!url) return ["#FFFFFF"];
        const buffer = await fetch(url, FetchResultTypes.Buffer).catch(
            () => null
        );

        if (!buffer) return ["#FFFFFF"];

        const colors = await getColors(buffer)
            .then((colors) =>
                colors.map((color) => color.hex() as HexColorString)
            )
            .catch(() => null);

        if (!colors) return ["#FFFFFF"];

        return colors;
    }

    async popularColor(url?: string | null) {
        if (!url) return "#FFFFFF";
        const colors = await this.popularColors(url);
        if (!colors) return "#FFFFFF";
        return pickRandom(colors);
    }

    invertColor(hex?: string) {
        if (!hex) return "#FFFFFF";
        if (hex.startsWith("#")) hex = hex.replace("#", "");

        // match hex color
        if (hex.length === 3)
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        if (hex.length !== 6) return "#FFFFFF";

        // invert colors
        const r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16);
        const g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16);
        const b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);

        const { pad } = this;

        return `#${pad(r)}${pad(g)}${pad(b)}`;
    }

    pad(txt: string, length?: number) {
        length = length ?? 2;
        const arr = [length].join("0");
        return (arr + txt).slice(-length);
    }
}
