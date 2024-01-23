import { container } from "@sapphire/framework";
import Valorant from "./index";
import {
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Collection,
    ComponentType,
    EmbedBuilder,
    StringSelectMenuBuilder,
} from "discord.js";

import moment from "moment";

export default class ValorantShop {
    private readonly valorant: Valorant;

    constructor(valorant: Valorant) {
        this.valorant = valorant;
    }

    async daily(interaction: ChatInputCommandInteraction) {
        const { database, logger, util } = container;

        const { options } = interaction;

        const userId =
            options.getString("valorant_player") || interaction.user.id;

        if (userId && /^[A-Za-z\s]*$/.test(userId))
            return interaction.reply({
                content: "**😢 That's not a valid Valorant Player**",
                ephemeral: true,
            });

        const db = await database.users.fetch(userId);
        const { valorant } = db;

        let ephemeral = false;

        if (valorant.privacy.daily === "private") {
            if (userId !== interaction.user.id)
                return interaction.reply({
                    content:
                        "**😢 That player has their privacy set to private**",
                    ephemeral: true,
                });

            ephemeral = true;
        }

        if (userId !== interaction.user.id) {
            const db = await database.users.fetch(userId);
            const { valorant } = db;

            if (valorant.privacy.daily === "private")
                return interaction.reply({
                    content:
                        "**😢 That player has their privacy set to private**",
                    ephemeral: true,
                });
        }

        const accounts = this.valorant.accounts.get(userId);

        if (!accounts)
            return interaction.reply({
                content: "**😢 You do not have any accounts linked**",
                ephemeral: true,
            });

        if (accounts.size === 0)
            return interaction.reply({
                content: "**😢 You do not have any accounts linked**",
                ephemeral: true,
            });

        await interaction.reply({
            content: "**😁 Getting your daily market(s)**",
            ephemeral,
        });

        const accountEmbeds: Collection<string, EmbedBuilder> =
            new Collection();
        const skinEmbeds: Collection<string, EmbedBuilder[]> = new Collection();
        const viewSelectMenus: Collection<string, StringSelectMenuBuilder> =
            new Collection();
        const wishlistSelectMenus: Collection<string, StringSelectMenuBuilder> =
            new Collection();

        const buttons: ButtonBuilder[] = [];

        try {
            for (let i = 0; i < accounts.size; i++) {
                const account = accounts.at(i);
                if (!account) continue;
                const expired = account.auth.getExpirationDate() < Date.now();
                if (expired) await account.auth.refresh();

                const { auth } = account;

                const storeRequest = await auth.Store.getStorefront(
                    account.player.sub
                );

                if (!storeRequest.data)
                    return interaction.editReply({
                        content: "**🥺 Could not get your daily market >.<**",
                    });

                const {
                    SkinsPanelLayout: {
                        SingleItemStoreOffers: offers,
                        SingleItemOffersRemainingDurationInSeconds: seconds,
                    },
                } = storeRequest.data;

                const timeRemaining = moment()
                    .utc()
                    .add(seconds, "seconds")
                    .unix();

                const card = await this.valorant.util.shopCard(
                    account,
                    "daily",
                    timeRemaining,
                    valorant.privacy.daily
                );

                accountEmbeds.set(account.username, card);

                const embeds = [];
                const viewOpts = [];
                const wishlistOpts = [];

                for (const offer of offers) {
                    const skin = this.valorant.skins.all.find(
                        (weapon) => offer.OfferID === weapon.levels[0].uuid
                    );

                    if (!skin) continue;

                    embeds.push(this.valorant.util.offerCard(skin, offer));
                    viewOpts.push({
                        label: skin.displayName,
                        value: skin.uuid,
                    });
                    wishlistOpts.push({
                        label: skin.displayName,
                        value: skin.uuid,
                    });
                }

                skinEmbeds.set(account.username, embeds);
                viewSelectMenus.set(
                    account.username,
                    util
                        .stringMenu()
                        .setCustomId(`valorant_daily_${account.username}_view`)
                        .setPlaceholder("Choose a skin to view")
                        .setMinValues(1)
                        .setMaxValues(1)
                        .setOptions(viewOpts)
                );

                wishlistSelectMenus.set(
                    account.username,
                    util
                        .stringMenu()
                        .setCustomId(
                            `valorant_daily_${account.username}_wishlist`
                        )
                        .setPlaceholder("Choose a skin to add to your wishlist")
                        .setMinValues(1)
                        .setMaxValues(wishlistOpts.length)
                        .setOptions(wishlistOpts)
                );

                buttons.push(
                    util
                        .button()
                        .setCustomId(`valorant_daily_${account.username}_${i}`)
                        .setLabel(
                            `${account.player.acct.game_name}#${account.player.acct.tag_line}`
                        )
                        .setStyle(ButtonStyle.Secondary)
                );
            }

            let accountEmbed = accountEmbeds.first();
            let offerEmbeds = skinEmbeds.first();
            let viewSelectMenu = viewSelectMenus.first();
            let wishlistSelectMenu = wishlistSelectMenus.first();
            if (
                !accountEmbed ||
                !offerEmbeds ||
                !viewSelectMenu ||
                !wishlistSelectMenu
            )
                return interaction.editReply({
                    content: "**🥺 Something went wrong >.<**",
                });

            let buttonRow = util
                .row()
                .setComponents(
                    buttons.map((btn, i) =>
                        i === 0 ? btn.setDisabled(true) : btn
                    )
                );

            let viewSelectRow = util.row().setComponents(viewSelectMenu);

            let wishlistSelectRow = util
                .row()
                .setComponents(wishlistSelectMenu);

            const showAccounts = await interaction.editReply({
                content: null,
                embeds: [accountEmbed, ...offerEmbeds],
                components: [buttonRow, viewSelectRow, wishlistSelectRow],
            });

            const btnCollector = showAccounts.createMessageComponentCollector({
                componentType: ComponentType.Button,
                filter: (i) => i.customId.startsWith("valorant_daily_"),
                time: 0,
            });

            const menuCollector = showAccounts.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                filter: (i) => i.customId.startsWith("valorant_daily_"),
                time: 0,
            });

            btnCollector.on("collect", async (i) => {
                const index = parseInt(i.customId.split("_")[3]);
                if (isNaN(index)) return;
                const username = i.customId.split("_")[2];
                accountEmbed = accountEmbeds.get(username);
                offerEmbeds = skinEmbeds.get(username);
                viewSelectMenu = viewSelectMenus.get(username);
                wishlistSelectMenu = wishlistSelectMenus.get(username);
                if (
                    !accountEmbed ||
                    !offerEmbeds ||
                    !viewSelectMenu ||
                    !wishlistSelectMenu
                )
                    return;

                buttonRow = util
                    .row()
                    .setComponents(
                        buttons.map((btn, i) =>
                            i === index
                                ? btn.setDisabled(true)
                                : btn.setDisabled(false)
                        )
                    );

                const embeds = [accountEmbed, ...offerEmbeds];

                viewSelectRow = util.row().setComponents(viewSelectMenu);

                wishlistSelectRow = util
                    .row()
                    .setComponents(wishlistSelectMenu);

                await i.update({
                    embeds,
                    components: [buttonRow, viewSelectRow, wishlistSelectRow],
                });
            });

            menuCollector.on("collect", async (i) => {
                switch (i.customId.split("_")[3]) {
                    case "view": {
                        const skinId = i.values[0];
                        const skin = this.valorant.skins.getByID(skinId);
                        if (!skin) return;
                        const skinInfo = this.valorant.skins.info(skin);
                        await this.valorant.util.createSkinCollectors(
                            i,
                            skinInfo,
                            ephemeral
                        );
                        break;
                    }
                    case "wishlist": {
                        await i.reply({
                            content: "**😁 Coming Soon™️!**",
                            ephemeral: true,
                        });
                        break;
                    }
                }
            });
        } catch (err) {
            logger.error(err);
            return interaction.editReply({
                content: "**🥺 Something went wrong >.<**",
            });
        }
    }
}
