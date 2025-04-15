import { FetchResultTypes, fetch } from "@sapphire/fetch";
import { pickRandom } from "@sapphire/utilities";
import type { HexColorString } from "discord.js";
import getColors from "get-image-colors";

export default class Kanvas {
    async popularColors(url?: string | null): Promise<HexColorString[]> {
        if (!url) return ["#FFFFFF"];
        const buffer = await fetch(url, FetchResultTypes.Buffer).catch(
            () => null,
        );

        if (!buffer) return ["#FFFFFF"];

        const colors = await getColors(buffer)
            .then((colors) =>
                colors.map((color) => color.hex() as HexColorString),
            )
            .catch(() => null);

        if (!colors) return ["#FFFFFF"];

        return colors;
    }

    async popularColor(url?: string | null) {
        if (!url) return "#FFFFFF";
        const colors = await this.popularColors(url);
        return pickRandom(colors);
    }
}
