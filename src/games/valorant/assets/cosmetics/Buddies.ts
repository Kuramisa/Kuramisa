import { Embed, StringDropdown } from "@builders";
import Valorant from "../..";
import {
    ActionRowBuilder,
    type MessageActionRowComponentBuilder,
} from "@discordjs/builders";
import kuramisa from "@kuramisa";
import { truncate } from "lodash";
import { fetchStoreOffers } from "..";

export default class ValorantBuddies {
    private readonly data: IValorantBuddy[];

    constructor(data: IValorantBuddy[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (buddy: string) =>
        this.data.find(
            (b) => b.displayName.toLowerCase() === buddy.toLowerCase()
        ) ??
        this.data.find((b) => b.uuid === buddy) ??
        this.data.find((b) =>
            b.levels.find(
                (l) => l.displayName.toLowerCase() === buddy.toLowerCase()
            )
        );

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
                components: levelComponents,
            },
        };
    }

    levelEmbed = (buddy: IValorantBuddy, level: IValorantBuddyLevel) =>
        new Embed()
            .setAuthor({ name: buddy.displayName })
            .setDescription(
                `**${kuramisa.kEmojis.get("val_points")} ${buddy.cost} VP**`
            )
            .setImage(level.displayIcon ?? buddy.displayIcon)
            .setColor("Random");

    levelEmbeds = (buddy: IValorantBuddy) =>
        buddy.levels.map((level) => this.levelEmbed(buddy, level));

    levelSelectMenu = (buddy: IValorantBuddy) =>
        new StringDropdown()
            .setCustomId("valorant_buddy_level_select")
            .setPlaceholder("Select a Buddy Level")
            .setOptions(
                buddy.levels.map((level, i) => ({
                    label: truncate(level.displayName, { length: 99 }),
                    value: i.toString(),
                }))
            );

    static async init() {
        const buddyData = await fetch(`${Valorant.assetsURL}/buddies`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        const buddyPrices = await fetchStoreOffers()
            .then((res: any) => res.data?.offers)
            .then((res) =>
                res?.filter((offer: any) => offer?.type === "buddy")
            );

        const data = buddyData.map((buddy: any) => ({
            ...buddy,
            cost:
                buddyPrices?.find((price: any) => price.buddy_id === buddy.uuid)
                    ?.cost ?? 0,
        }));

        return new ValorantBuddies(data);
    }
}
