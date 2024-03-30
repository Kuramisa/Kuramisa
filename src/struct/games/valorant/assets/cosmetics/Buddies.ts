import { EmbedBuilder } from "discord.js";
import Valorant from "../..";
import {
    ActionRowBuilder,
    MessageActionRowComponentBuilder,
    StringSelectMenuBuilder
} from "@discordjs/builders";
import { container } from "@sapphire/framework";

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
            level: {
                names: levelNames,
                embeds: levelEmbeds,
                components: levelComponents
            }
        };
    }

    levelEmbed = (buddy: IValorantBuddy, level: IValorantBuddyLevel) =>
        new EmbedBuilder()
            .setAuthor({ name: buddy.displayName })
            .setDescription(
                `**${container.emojis.get("val_points")} ${buddy.cost} VP**`
            )
            .setImage(level.displayIcon ?? buddy.displayIcon)
            .setColor("Random");

    levelEmbeds = (buddy: IValorantBuddy) =>
        buddy.levels.map((level) => this.levelEmbed(buddy, level));

    levelSelectMenu = (buddy: IValorantBuddy) =>
        new StringSelectMenuBuilder()
            .setCustomId("valorant_buddy_level_select")
            .setPlaceholder("Select a Buddy Level")
            .setOptions(
                buddy.levels.map((level, i) => ({
                    label: container.util.shorten(level.displayName, 99),
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
            .then((res: any) => res.data.offers)
            .then((res) => res.filter((offer: any) => offer.type === "buddy"));

        const data = buddyData.map((buddy: any) => ({
            ...buddy,
            cost:
                buddyPrices.find((price: any) => price.buddy_id === buddy.uuid)
                    ?.cost ?? 0
        }));

        return new ValorantBuddies(data);
    }
}
