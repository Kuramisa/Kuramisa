import { Embed, StringDropdown } from "@builders";
import { fetch } from "@games/valorant/API";
import type {
    APIValorantBuddy,
    APIValorantBuddyLevel,
} from "@typings/APIValorant";
import {
    ActionRowBuilder,
    type MessageActionRowComponentBuilder,
} from "discord.js";
import truncate from "lodash/truncate";

export default class ValorantBuddies {
    private readonly data: APIValorantBuddy[];

    constructor(data: APIValorantBuddy[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (buddy: string) =>
        this.data.find(
            (b) => b.displayName.toLowerCase() === buddy.toLowerCase(),
        ) ??
        this.data.find((b) => b.uuid === buddy) ??
        this.data.find((b) =>
            b.levels.find(
                (l) => l.displayName.toLowerCase() === buddy.toLowerCase(),
            ),
        );

    info(buddy: APIValorantBuddy) {
        // Level Information
        const levelNames = buddy.levels.map((level) => level.displayName);
        const levelEmbeds = this.levelEmbeds(buddy);
        const levelComponents =
            new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                this.levelSelectMenu(buddy),
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

    levelEmbed = (buddy: APIValorantBuddy, level?: APIValorantBuddyLevel) =>
        new Embed()
            .setAuthor({ name: buddy.displayName })
            .setImage(level?.displayIcon ?? buddy.displayIcon)
            .setColor("Random");

    levelEmbeds = (buddy: APIValorantBuddy) =>
        buddy.levels.map((level) => this.levelEmbed(buddy, level));

    levelSelectMenu = (buddy: APIValorantBuddy) =>
        new StringDropdown()
            .setCustomId("valorant_buddy_level_select")
            .setPlaceholder("Select a Buddy Level")
            .setOptions(
                buddy.levels.map((level, i) => ({
                    label: truncate(level.displayName, { length: 99 }),
                    value: i.toString(),
                })),
            );

    static readonly init = async () =>
        new ValorantBuddies(await fetch("buddies"));
}
