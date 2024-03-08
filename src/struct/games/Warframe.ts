import { container } from "@sapphire/pieces";
import moment from "moment";
import WarframeMarket from "warframe-market";
import WarframeItems from "warframe-items";
import { Platform } from "warframe-market/lib/typings";
import {
    AutocompleteInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    ComponentType,
} from "discord.js";

const { MARKET_API } = process.env;

export default class Warframe {
    readonly market: WarframeMarket;
    readonly items: WarframeItems;

    constructor() {
        this.market = new WarframeMarket(MARKET_API as string);
        this.items = new WarframeItems({
            category: ["All"],
            ignoreEnemies: true,
        });
    }

    async itemAutocomplete(interaction: AutocompleteInteraction) {
        const { options } = interaction;

        const focused = options.getFocused();

        let items = this.items.filter((item) => item.tradable);

        if (focused.length > 0)
            items = items.filter((item) => item.name?.startsWith(focused));

        items = items.slice(0, 25);

        await interaction.respond(
            items.map((choice) => ({
                name: choice.name as string,
                value: choice.name as string,
            }))
        );
    }

    async orders(interaction: ChatInputCommandInteraction) {
        const { util } = container;

        const { options, user } = interaction;

        const item = options.getString("item", true);
        const userStatus = options.getString("user_status");

        await interaction.deferReply();

        const items = await this.market.Items.GetItemOrdersAsync(
            item.toLowerCase().replace(/ /g, "_"),
            Platform.PC
        );

        if (items.error) {
            const msg = await interaction.editReply({
                content: `No Orders for **${item}** found`,
            });
            setTimeout(() => {
                msg.delete().catch(() => {
                    return;
                });
            }, 2000);
            return;
        }

        let orders = items.payload.orders
            .sort((a, b) => a.platinum - b.platinum)
            .sort(
                (a, b) =>
                    moment(b.creation_date).unix() -
                    moment(a.creation_date).unix()
            );

        if (userStatus)
            orders = orders.filter((order) => order.user.status === userStatus);

        let page = 0;

        const typeButtons = [
            util
                .button()
                .setCustomId("orders_sellers")
                .setLabel("Sellers")
                .setStyle(ButtonStyle.Primary),
            util
                .button()
                .setCustomId("orders_buyers")
                .setLabel("Buyers")
                .setStyle(ButtonStyle.Success),
        ];

        const navButtons = [
            util
                .button()
                .setCustomId("previous_order")
                .setLabel("Order")
                .setEmoji("⬅️")
                .setStyle(ButtonStyle.Secondary),
            util
                .button()
                .setCustomId("next_order")
                .setLabel("Order")
                .setEmoji("➡️")
                .setStyle(ButtonStyle.Secondary),
        ];

        const bottomButtons = [
            util
                .button()
                .setCustomId("create_paste")
                .setLabel("Create Paste")
                .setStyle(ButtonStyle.Success),
        ];

        const typeRow = util.row().setComponents(typeButtons);
        const navRow = util.row().setComponents(navButtons);
        const bottomRow = util.row().setComponents(bottomButtons);

        const sellerEmbeds = orders
            .filter((order) => order.order_type === "sell")
            .map((order, index) =>
                util
                    .embed()
                    .setTitle(`Sell Orders for ${item}`)
                    .setDescription(
                        `
                    \`Cost\`: ${order.platinum} (each)
                    \`Quantity\`: ${order.quantity}
                    \`Last Updated\`: <t:${moment(order.last_update).unix()}:R>
                    \`Created\`: <t:${moment(order.creation_date).unix()}:R>
                `
                    )
                    .addFields({
                        name: "Seller",
                        value: `
                    \`In Game Name\`: ${order.user.ingame_name}
                    \`Reputation\`: ${order.user.reputation}
                    \`Status\`: ${_.capitalize(order.user.status)}
                    \`Last Seen\`*: <t:${moment(order.user.last_seen).unix()}:R>
                `,
                    })
                    .setFooter({
                        text: `Page ${index + 1} of ${orders.length}`,
                    })
            );

        const buyerEmbeds = orders
            .filter((order) => order.order_type === "buy")
            .map((order, index) =>
                util
                    .embed()
                    .setTitle(`Buy Orders for ${item}`)
                    .setDescription(
                        `
                    \`Cost\`: ${order.platinum} (each)
                    \`Quantity\`: ${order.quantity}
                    \`Last Updated\`: <t:${moment(order.last_update).unix()}:R>
                    \`Created\`: <t:${moment(order.creation_date).unix()}:R>
                `
                    )
                    .addFields({
                        name: "Buyer",
                        value: `
                    \`In Game Name\`: ${order.user.ingame_name}
                    \`Reputation\`: ${order.user.reputation}
                    \`Status\`: ${_.capitalize(order.user.status)}
                    \`Last Seen\`*: <t:${moment(order.user.last_seen).unix()}:R>
                `,
                    })
                    .setFooter({
                        text: `Page ${index + 1} of ${orders.length}`,
                    })
            );

        let embeds = sellerEmbeds;

        const message = await interaction.editReply({
            embeds: [sellerEmbeds[page]],
            components: [typeRow, navRow, bottomRow],
        });

        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: (i) =>
                (i.customId === "orders_sellers" ||
                    i.customId === "orders_buyers" ||
                    i.customId === "previous_order" ||
                    i.customId === "next_order") &&
                i.user.id === user.id,
        });

        collector.on("collect", async (i) => {
            switch (i.customId) {
                case "orders_sellers": {
                    embeds = sellerEmbeds;
                    break;
                }
                case "orders_buyers": {
                    embeds = buyerEmbeds;
                    break;
                }
                case "previous_order": {
                    page = page > 0 ? --page : embeds.length - 1;
                    break;
                }
                case "next_order": {
                    page = page + 1 < embeds.length ? ++page : 0;
                    break;
                }
                default:
                    break;
            }

            await i.deferUpdate();
            await i.editReply({
                embeds: [embeds[page]],
                components: [typeRow, navRow, bottomRow],
            });

            collector.resetTimer();
        });
    }
}
