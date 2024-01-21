import { Buddies } from "@valapi/valorant-api.com";
import { EmbedBuilder } from "discord.js";

export default class ValorantBuddies {
    private readonly data: Buddies.Buddies<"en-US">[];

    constructor(data: Buddies.Buddies<"en-US">[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find(buddy => buddy.displayName === name || buddy.levels.find(level => level.displayName === name));
    }

    getByID(id: string) {
        return this.data.find(buddy => buddy.uuid === id);
    }

    // TODO: Add Embed method
    embed = (buddy: Buddies.Buddies<"en-US">) => new EmbedBuilder()
        .setTitle(buddy.displayName);
}