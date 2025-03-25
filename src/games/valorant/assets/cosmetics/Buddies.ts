import {
    ActionRowBuilder,
    type MessageActionRowComponentBuilder,
} from "@discordjs/builders";
import { fetch } from "@sapphire/fetch";
import { Embed, StringDropdown } from "Builders";
import truncate from "lodash/truncate";
import logger from "Logger";
import type { ValorantBuddy, ValorantBuddyLevel } from "typings/Valorant";

import Valorant from "../..";

export default class ValorantBuddies {
    private readonly data: ValorantBuddy[];

    constructor(data: ValorantBuddy[]) {
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

    info(buddy: ValorantBuddy) {
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

    levelEmbed = (buddy: ValorantBuddy, level: ValorantBuddyLevel) =>
        new Embed()
            .setAuthor({ name: buddy.displayName })
            .setImage(level.displayIcon ?? buddy.displayIcon)
            .setColor("Random");

    levelEmbeds = (buddy: ValorantBuddy) =>
        buddy.levels.map((level) => this.levelEmbed(buddy, level));

    levelSelectMenu = (buddy: ValorantBuddy) =>
        new StringDropdown()
            .setCustomId("valorant_buddy_level_select")
            .setPlaceholder("Select a Buddy Level")
            .setOptions(
                buddy.levels.map((level, i) => ({
                    label: truncate(level.displayName, { length: 99 }),
                    value: i.toString(),
                })),
            );

    static async init() {
        const data = await fetch<any>(`${Valorant.assetsURL}/buddies`)
            .then((res) => res.data)
            .catch((err) => {
                logger.error(err);
                return [];
            });

        return new ValorantBuddies(data);
    }
}
