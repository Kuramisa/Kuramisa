import { EmbedBuilder } from "discord.js";
import Valorant from "../..";

export default class ValorantBuddies {
    private readonly data: IValorantBuddy[];

    constructor(data: IValorantBuddy[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find(
            (buddy) =>
                buddy.displayName === name ??
                buddy.levels.find((level) => level.displayName === name)
        );
    }

    getByID(id: string) {
        return this.data.find((buddy) => buddy.uuid === id);
    }

    // TODO: Add Embed method
    embed = (buddy: IValorantBuddy) =>
        new EmbedBuilder().setTitle(buddy.displayName);

    // TODO: Add buddy prices
    static async fetch() {
        const data = await fetch(`${Valorant.assetsURL}/buddies`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantBuddies(data);
    }
}
