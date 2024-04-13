import { container } from "@sapphire/framework";
import Valorant from "./index";
import {
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Collection,
    ComponentType,
    EmbedBuilder,
    StringSelectMenuBuilder
} from "discord.js";

import moment from "moment";
import { Bundles } from "./assets";

export default class ValorantShop {
    private readonly valorant: Valorant;

    private readonly somethingWentWrong = "**🥺 Something went wrong >.<**";

    constructor(valorant: Valorant) {
        this.valorant = valorant;
    }

    async daily(interaction: ChatInputCommandInteraction) {
        const { database, logger, util } = container;
        const { options, user } = interaction;
        const { valorant } = this;

        const userId = options.getString("valorant_player") ?? user.id;

        if (userId && /^[A-Za-z\s]*$/.test(userId))
            return interaction.reply({
                content: "**😢 That's not a valid Valorant Player**",
                ephemeral: true
            });

        const db = await database.users.fetch(userId);
        const { valorant: valDb } = db;

        let ephemeral = false;

        if (valDb.privacy.daily !== "public") {
            if (userId !== user.id && valDb.privacy.daily === "private")
                return interaction.reply({
                    content:
                        "**😢 That player has their Daily Shop set to private**",
                    ephemeral: true
                });

            ephemeral = true;
        }

        const accounts = valorant.accounts.get(userId);

        if (!accounts)
            return interaction.reply({
                content: "**😢 You do not have any accounts linked**",
                ephemeral: true
            });

        if (accounts.size === 0)
            return interaction.reply({
                content: "**😢 You do not have any accounts linked**",
                ephemeral: true
            });

        await interaction.reply({
            content: "**😁 Getting your daily market(s)**",
            ephemeral
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
                        content: "**🥺 Could not get your daily market >.<**"
                    });

                const {
                    SkinsPanelLayout: {
                        SingleItemStoreOffers: offers,
                        SingleItemOffersRemainingDurationInSeconds: seconds
                    }
                } = storeRequest.data;

                const timeRemaining = moment()
                    .utc()
                    .add(seconds, "seconds")
                    .unix();

                const card = await valorant.util.shopCard(
                    account,
                    "daily",
                    timeRemaining,
                    valDb.privacy.daily
                );

                accountEmbeds.set(account.username, card);

                const embeds = [];
                const viewOpts = [];
                const wishlistOpts = [];

                for (const offer of offers) {
                    const skin = valorant.skins.getByLevelID(offer.OfferID);

                    if (!skin) continue;

                    embeds.push(valorant.util.offerCard(skin, offer));
                    viewOpts.push({
                        label: skin.displayName,
                        value: skin.uuid
                    });
                    wishlistOpts.push({
                        label: skin.displayName,
                        value: skin.uuid
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
                    content: this.somethingWentWrong
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
                components: [buttonRow, viewSelectRow, wishlistSelectRow]
            });

            const btnCollector = showAccounts.createMessageComponentCollector({
                componentType: ComponentType.Button,
                filter: (i) => i.customId.startsWith("valorant_daily_"),
                time: 0
            });

            const menuCollector = showAccounts.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                filter: (i) => i.customId.startsWith("valorant_daily_"),
                time: 0
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
                    components: [buttonRow, viewSelectRow, wishlistSelectRow]
                });
            });

            menuCollector.on("collect", async (i) => {
                switch (i.customId.split("_")[3]) {
                    case "view": {
                        const skinId = i.values[0];
                        const skin = valorant.skins.getByID(skinId);
                        if (!skin) return;
                        const skinInfo = valorant.skins.info(skin);
                        await valorant.util.createSkinCollectors(
                            i,
                            skinInfo,
                            ephemeral
                        );
                        break;
                    }
                    case "wishlist": {
                        await i.reply({
                            content: "**😁 Coming Soon™️!**",
                            ephemeral: true
                        });
                        break;
                    }
                }
            });
        } catch (err) {
            logger.error(err);
            return interaction.editReply({
                content: this.somethingWentWrong
            });
        }
    }

    async featured(interaction: ChatInputCommandInteraction) {
        const { util } = container;
        const { valorant } = this;
        const { bundles } = valorant;

        await interaction.reply({
            content: "**Getting the featured market ^^**"
        });

        const featured = await bundles.fetchFeatured();

        const bundleEmbeds: Collection<string, EmbedBuilder> = new Collection();
        const itemEmbeds: Collection<string, EmbedBuilder[]> = new Collection();

        const viewSelectMenus: Collection<string, StringSelectMenuBuilder> =
            new Collection();
        const wishlistSelectMenus: Collection<string, StringSelectMenuBuilder> =
            new Collection();

        const bundleButtons: ButtonBuilder[] = [];

        for (let i = 0; i < featured.length; i++) {
            const bundle = featured[i];

            const timeRemaining = moment()
                .utc()
                .add(bundle.secondsRemaining, "seconds")
                .unix();

            const bundleEmbed = Bundles.embed(bundle, timeRemaining);

            const embeds: EmbedBuilder[] = [];
            const viewOpts = [];
            const wishlistOpts = [];

            const { items } = bundle;

            for (const bundleItem of items) {
                // TODO: Remove as any and fix the typings later
                embeds.push(await Bundles.itemEmbed(bundleItem as any));

                if (bundleItem.type === "skin_level") {
                    viewOpts.push({
                        label: bundleItem.displayName,
                        value: bundleItem.uuid
                    });

                    wishlistOpts.push({
                        label: bundleItem.displayName,
                        value: bundleItem.uuid
                    });
                }
            }

            itemEmbeds.set(bundle.uuid, embeds);
            bundleEmbeds.set(bundle.uuid, bundleEmbed);
            bundleButtons.push(
                util
                    .button()
                    .setCustomId(`valorant_featured_${bundle.uuid}_${i}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel(bundle.displayName)
            );

            viewSelectMenus.set(
                bundle.uuid,
                util
                    .stringMenu()
                    .setCustomId(`valorant_featured_${bundle.uuid}_view`)
                    .setPlaceholder("Choose a skin to view")
                    .setMinValues(1)
                    .setMaxValues(1)
                    .setOptions(viewOpts)
            );

            wishlistSelectMenus.set(
                bundle.uuid,
                util
                    .stringMenu()
                    .setCustomId(`valorant_featured_${bundle.uuid}_wishlist`)
                    .setPlaceholder("Choose a skin to add to your wishlist")
                    .setMinValues(1)
                    .setMaxValues(wishlistOpts.length)
                    .setOptions(wishlistOpts)
            );
        }

        let currentItems = itemEmbeds.first();
        let currentBundle = bundleEmbeds.first();
        let viewSelectMenu = viewSelectMenus.first();
        let wishlistSelectMenu = wishlistSelectMenus.first();

        if (
            !currentItems ||
            !currentBundle ||
            !viewSelectMenu ||
            !wishlistSelectMenu
        )
            return interaction.editReply({
                content: "**🥺 Something went wrong >.<**"
            });

        let buttonRow = util
            .row()
            .setComponents(
                bundleButtons.map((btn, i) =>
                    i === 0 ? btn.setDisabled(true) : btn
                )
            );

        let viewSelectRow = util.row().setComponents(viewSelectMenu);

        let wishlistSelectRow = util.row().setComponents(wishlistSelectMenu);

        const msg = await interaction.editReply({
            content: "",
            embeds: [currentBundle, ...currentItems],
            components: [buttonRow, viewSelectRow, wishlistSelectRow]
        });

        const btnCollector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: (i) => i.customId.startsWith("valorant_featured_"),
            time: 0
        });

        const menuCollector = msg.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter: (i) => i.customId.startsWith("valorant_featured_"),
            time: 0
        });

        btnCollector.on("collect", async (i) => {
            const index = parseInt(i.customId.split("_")[3]);
            if (isNaN(index)) return;
            const uuid = i.customId.split("_")[2];
            currentItems = itemEmbeds.get(uuid);
            currentBundle = bundleEmbeds.get(uuid);
            viewSelectMenu = viewSelectMenus.get(uuid);
            wishlistSelectMenu = wishlistSelectMenus.get(uuid);

            if (
                !currentItems ||
                !currentBundle ||
                !viewSelectMenu ||
                !wishlistSelectMenu
            )
                return;
            buttonRow = util
                .row()
                .setComponents(
                    bundleButtons.map((btn, i) =>
                        i === index
                            ? btn.setDisabled(true)
                            : btn.setDisabled(false)
                    )
                );

            const embeds = [currentBundle, ...currentItems];

            viewSelectRow = util.row().setComponents(viewSelectMenu);
            wishlistSelectRow = util.row().setComponents(wishlistSelectMenu);

            await i.update({
                embeds,
                components: [buttonRow, viewSelectRow, wishlistSelectRow]
            });
        });

        menuCollector.on("collect", async (i) => {
            switch (i.customId.split("_")[3]) {
                case "view": {
                    const skinId = i.values[0];
                    const skin = valorant.skins.getByID(skinId);
                    if (!skin) return;
                    const skinInfo = valorant.skins.info(skin);
                    await valorant.util.createSkinCollectors(i, skinInfo);
                    break;
                }
                case "wishlist": {
                    await i.reply({
                        content: "**😁 Coming Soon™️!**",
                        ephemeral: true
                    });
                    break;
                }
            }
        });
    }
}
