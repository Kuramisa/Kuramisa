import { KButton, KRow, KEmbed } from "@builders";
import kuramisa from "@kuramisa";
import {
    type ButtonInteraction,
    type ChatInputCommandInteraction,
    ComponentType,
    Message,
    type InteractionCollector
} from "discord.js";

type Interactions = ButtonInteraction | ChatInputCommandInteraction;

export default class Pagination {
    static async embedContents(
        interaction: ButtonInteraction | ChatInputCommandInteraction,
        contents: string[] | string[][],
        title?: string,
        ephemeral = false,
        timeout = 0
    ) {
        const { kEmojis } = kuramisa;

        let page = 0;

        const buttons = [
            new KButton()
                .setCustomId("previous_page")
                .setEmoji(kEmojis.get("left_arrow")?.toString() ?? "⬅️"),

            new KButton()
                .setCustomId("next_page")
                .setEmoji(kEmojis.get("right_arrow")?.toString() ?? "➡️")
        ];

        const row = new KRow().addComponents(buttons);

        const embeds = contents.map((content, index) => {
            const embed = new KEmbed();
            if (typeof content == "object") {
                embed.setDescription(content.join("\n"));
            } else {
                embed.setDescription(content);
            }

            embed.setFooter({
                text: `Page ${index + 1} of ${contents.length}`
            });
            if (title) embed.setTitle(title);

            return embed;
        });

        if (!interaction.deferred) await interaction.deferReply({ ephemeral });

        const message = await interaction.editReply({
            embeds: [embeds[page]],
            components: embeds.length < 2 ? [] : [row]
        });

        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: (i) =>
                i.customId === "previous_page" || i.customId === "next_page",
            time: timeout
        });

        collector
            .on("collect", async (i) => {
                switch (i.customId) {
                    case "previous_page":
                        page = page > 0 ? --page : embeds.length - 1;
                        break;
                    case "next_page":
                        page = page + 1 < embeds.length ? ++page : 0;
                        break;
                    default:
                        break;
                }

                await i.deferUpdate();
                await i.editReply({
                    embeds: [embeds[page]],
                    components: [row]
                });

                collector.resetTimer();
            })
            .on("end", (_, reason) => {
                if (
                    reason !== "messageDelete" &&
                    !ephemeral &&
                    embeds.length < 2
                ) {
                    const disabledRow = new KRow().addComponents(
                        buttons[0].setDisabled(true),
                        buttons[1].setDisabled(true)
                    );

                    message.edit({
                        embeds: [embeds[page]],
                        components: embeds.length < 2 ? [] : [disabledRow]
                    });
                }
            });
    }

    static async texts(
        interaction: Interactions | Message,
        texts: string[],
        ephemeral = false,
        timeout = 0
    ) {
        const { kEmojis } = kuramisa;

        let page = 0;

        const buttons = [
            new KButton()
                .setCustomId("previous_page")
                .setEmoji(kEmojis.get("left_arrow")?.toString() ?? "⬅️"),

            new KButton()
                .setCustomId("next_page")
                .setEmoji(kEmojis.get("right_arrow")?.toString() ?? "➡️")
        ];

        const row = new KRow().addComponents(buttons);

        let collector: InteractionCollector<ButtonInteraction>;

        if (interaction instanceof Message) {
            const message = await interaction.edit({
                content: texts[page],
                components: texts.length > 1 ? [row] : []
            });

            collector = message.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: timeout
            });
        } else {
            if (!interaction.replied && !interaction.deferred)
                await interaction.deferReply({ ephemeral });

            if (interaction.ephemeral) ephemeral = true;

            const message = await interaction.editReply({
                content: texts[page],
                components: texts.length > 1 ? [row] : []
            });

            collector = message.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: timeout
            });
        }

        collector
            .on("collect", async (i) => {
                switch (i.customId) {
                    case "previous_page":
                        page = page > 0 ? --page : texts.length - 1;
                        break;
                    case "next_page":
                        page = page + 1 < texts.length ? ++page : 0;
                        break;
                    default:
                        page = 0;
                        break;
                }

                await i.deferUpdate();
                await i.editReply({
                    content: texts[page],
                    components: texts.length > 1 ? [row] : []
                });

                collector.resetTimer();
            })
            .on("end", async (_, reason) => {
                if (
                    reason !== "messageDelete" &&
                    !ephemeral &&
                    texts.length < 2
                ) {
                    const disableRow = new KRow().addComponents(
                        buttons.map((b) => b.setDisabled(true))
                    );

                    if (interaction instanceof Message)
                        await interaction.edit({ components: [disableRow] });
                    else
                        await interaction.editReply({
                            components: [disableRow]
                        });
                }
            });
    }

    static async embeds(
        interaction: Interactions | Message,
        embeds: KEmbed[],
        ephemeral = false,
        timeout = 0
    ) {
        const { kEmojis } = kuramisa;

        let page = 0;

        const buttons = [
            new KButton()
                .setCustomId("previous_page")
                .setEmoji(kEmojis.get("left_arrow")?.toString() ?? "⬅️"),

            new KButton()
                .setCustomId("next_page")
                .setEmoji(kEmojis.get("right_arrow")?.toString() ?? "➡️")
        ];

        const row = new KRow().addComponents(buttons);

        let collector: InteractionCollector<ButtonInteraction>;

        if (interaction instanceof Message) {
            const message = await interaction.edit({
                embeds: [embeds[page]],
                components: embeds.length > 1 ? [row] : []
            });

            collector = message.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: timeout
            });
        } else {
            if (!interaction.replied && !interaction.deferred)
                await interaction.deferReply({ ephemeral });

            if (interaction.ephemeral) ephemeral = true;

            const message = await interaction.editReply({
                content: null,
                embeds: [embeds[page]],
                components: embeds.length > 1 ? [row] : []
            });

            collector = message.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: timeout
            });
        }

        collector
            .on("collect", async (i) => {
                switch (i.customId) {
                    case "previous_page":
                        page = page > 0 ? --page : embeds.length - 1;
                        break;
                    case "next_page":
                        page = page + 1 < embeds.length ? ++page : 0;
                        break;
                    default:
                        page = 0;
                        break;
                }

                await i.deferUpdate();
                await i.editReply({
                    embeds: [embeds[page]],
                    components: embeds.length > 1 ? [row] : []
                });

                collector.resetTimer();
            })
            .on("end", async (_, reason) => {
                if (
                    reason !== "messageDelete" &&
                    !ephemeral &&
                    embeds.length < 2
                ) {
                    const disableRow = new KRow().addComponents(
                        buttons.map((b) => b.setDisabled(true))
                    );

                    if (interaction instanceof Message)
                        await interaction.edit({ components: [disableRow] });
                    else
                        await interaction.editReply({
                            components: [disableRow]
                        });
                }
            });
    }
}
