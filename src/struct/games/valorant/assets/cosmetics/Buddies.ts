import { KEmbed, KStringDropdown } from "@builders";
import Valorant from "../..";
import {
    ActionRowBuilder,
    type MessageActionRowComponentBuilder
} from "@discordjs/builders";
import kuramisa from "@kuramisa";
import { truncate } from "lodash";

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

    info(buddy: IValorantBuddy) {
        // Level Information
        const levelNames = buddy.levels.map((level) => level.displayName);
        const levelEmbeds = this.levelEmbeds(buddy);
        const levelComponents =
            new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                this.levelSelectMenu(buddy)
            );

        return {
            name: buddy.displayName,
            uuid: buddy.uuid,
            level: {
                names: levelNames,
                embeds: levelEmbeds,
                components: levelComponents
            }
        };
    }

    levelEmbed = (buddy: IValorantBuddy, level: IValorantBuddyLevel) =>
        new KEmbed()
            .setAuthor({ name: buddy.displayName })
            .setDescription(
                `**${kuramisa.kEmojis.get("val_points")} ${buddy.cost} VP**`
            )
            .setImage(level.displayIcon ?? buddy.displayIcon)
            .setColor("Random");

    levelEmbeds = (buddy: IValorantBuddy) =>
        buddy.levels.map((level) => this.levelEmbed(buddy, level));

    levelSelectMenu = (buddy: IValorantBuddy) =>
        new KStringDropdown()
            .setCustomId("valorant_buddy_level_select")
            .setPlaceholder("Select a Buddy Level")
            .setOptions(
                buddy.levels.map((level, i) => ({
                    label: truncate(level.displayName, { length: 99 }),
                    value: i.toString()
                }))
            );

    static async fetch() {
        const buddyData = await fetch(`${Valorant.assetsURL}/buddies`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        const buddyPrices = await fetch(
            "https://api.henrikdev.xyz/valorant/v2/store-offers"
        )
            .then((res) => res.json())
            .then((res: any) => res.data?.offers)
            .then((res) =>
                res?.filter((offer: any) => offer?.type === "buddy")
            );

        const data = buddyData.map((buddy: any) => ({
            ...buddy,
            cost:
                buddyPrices?.find((price: any) => price.buddy_id === buddy.uuid)
                    ?.cost ?? 0
        }));

        return new ValorantBuddies(data);
    }
}
