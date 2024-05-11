import kuramisa from "@kuramisa";
import type Valorant from "./";
import {
    type ActionRowBuilder,
    ButtonStyle,
    type ChatInputCommandInteraction,
    Collection,
    ComponentType,
    type MessageActionRowComponentBuilder,
    type User
} from "discord.js";
import { capitalize } from "lodash";
import { KEmbed, KStringSelectMenu, KRow, KButton } from "@builders";

export default class ValorantWishlist {
    private readonly valorant: Valorant;

    constructor(valorant: Valorant) {
        this.valorant = valorant;
    }

    async wishlistView(interaction: ChatInputCommandInteraction) {
        const { database, kEmojis: emojis, owners } = kuramisa;
        const { options, user } = interaction;
        const { valorant } = this;

        if (!owners.some((owner) => owner.id === user.id))
            return interaction.reply({
                content: "**This command is currently under development.**",
                ephemeral: true
            });

        const userId = options.getString("valorant_player") ?? user.id;

        if (userId && /^[A-Za-z\s]*$/.test(userId))
            return interaction.reply({
                content: "**😢 That's not a valid Valorant Player**",
                ephemeral: true
            });

        const db = await database.users.fetch(userId);

        const { valorant: valDb } = db;

        let ephemeral = false;

        if (valDb.privacy.wishlist !== "public") {
            if (userId !== user.id && valDb.privacy.wishlist === "private")
                return interaction.reply({
                    content:
                        "**😢 That player has their Wishlist set to private**"
                });

            ephemeral = true;
        }

        await interaction.reply({
            content: "**😁 Getting your wishlist**",
            ephemeral
        });

        const { wishlist } = valDb;

        if (!wishlist || wishlist.length === 0)
            return interaction.editReply({
                content: `**😢 No items in ${
                    userId === user.id ? "your" : `${user.globalName}'s`
                } wishlist**`
            });

        const skinUuids = valDb.wishlist.filter((it) => it.type === "skin");
        const buddyUuids = valDb.wishlist.filter((it) => it.type === "buddy");
        const cardUuids = valDb.wishlist.filter((it) => it.type === "card");
        const sprayUuids = valDb.wishlist.filter((it) => it.type === "spray");
        const titleUuids = valDb.wishlist.filter((it) => it.type === "title");

        const skins = [];
        const buddies = [];
        const cards = [];
        const sprays = [];
        const titles = [];

        for (const uuid of skinUuids) {
            const skin = valorant.skins.getByID(uuid.uuid);
            if (skin) skins.push(skin);
        }

        for (const uuid of buddyUuids) {
            const buddy = valorant.buddies.getByID(uuid.uuid);
            if (buddy) buddies.push(buddy);
        }

        for (const uuid of cardUuids) {
            const card = valorant.playerCards.getByID(uuid.uuid);
            if (card) cards.push(card);
        }

        for (const uuid of sprayUuids) {
            const spray = valorant.sprays.getByID(uuid.uuid);
            if (spray) sprays.push(spray);
        }

        for (const uuid of titleUuids) {
            const title = valorant.playerTitles.getByID(uuid.uuid);
            if (title) titles.push(title);
        }

        const skinEmbeds = [];
        const skinInfos = [];
        for (const skin of skins) {
            const skinInfo = valorant.skins.info(skin);
            if (!skinInfo) continue;
            skinInfos.push(skinInfo);
            skinEmbeds.push(
                new KEmbed()
                    .setAuthor({
                        name: skin.displayName,
                        iconURL: skin.displayIcon
                    })
                    .setThumbnail(skin.displayIcon)
                    .setDescription(
                        `**<:val_points:1114492900181553192> ${skin.cost} VP**`
                    )
                    .setColor("Random")
            );
        }

        const buddyInfos = [];
        const buddyEmbeds = [];
        for (const buddy of buddies) {
            const buddyInfo = valorant.buddies.info(buddy);
            if (!buddyInfo) continue;
            buddyInfos.push(buddyInfo);
            buddyEmbeds.push(
                new KEmbed()
                    .setAuthor({
                        name: buddy.displayName,
                        iconURL: buddy.displayIcon
                    })
                    .setThumbnail(buddy.displayIcon)
                    .setDescription(
                        `**<:val_points:1114492900181553192> ${buddy.cost} VP**`
                    )
                    .setColor("Random")
            );
        }

        const cardEmbeds = cards.map((card) =>
            valorant.playerCards.embed(card)
        );

        const sprayInfos = [];
        const sprayEmbeds = [];
        for (const spray of sprays) {
            const sprayInfo = valorant.sprays.info(spray);
            if (!sprayInfo) continue;
            sprayInfos.push(sprayInfo);
            sprayEmbeds.push(
                new KEmbed()
                    .setAuthor({
                        name: spray.displayName,
                        iconURL: spray.displayIcon
                    })
                    .setThumbnail(spray.displayIcon)
                    .setDescription(
                        `**<:val_points:1114492900181553192> ${spray.cost} VP**`
                    )
                    .setColor("Random")
            );
        }

        const titleEmbeds = titles.map((title) =>
            valorant.playerTitles.embed(title)
        );

        const wishlistInfo: Collection<
            string,
            {
                embeds: KEmbed[];
                selectMenus: ActionRowBuilder<MessageActionRowComponentBuilder>[];
            }
        > = new Collection();

        const skinSelectMenus = [];
        let temp: any[] = [];

        for (let i = 1; i <= skinInfos.length; i++) {
            const skin = skinInfos[i - 1];
            if (!skin) continue;
            temp.push({
                label: skin.name,
                value: skin.uuid
            });
            if (
                i % 4 === 0 ||
                (skinInfos.length < 4 && i === skinInfos.length) ||
                i === skinInfos.length - 1 // Last item
            ) {
                skinSelectMenus.push(
                    new KRow().setComponents(
                        new KStringSelectMenu()
                            .setCustomId("valorant_wishlist_skin")
                            .setPlaceholder("Select a skin")
                            .addOptions(temp)
                    )
                );
            }
        }

        wishlistInfo.set("skins", {
            embeds: skinEmbeds,
            selectMenus: skinSelectMenus
        });

        const buddySelectMenus = [];
        temp = [];

        for (let i = 0; i < buddyInfos.length; i++) {
            const buddy = buddyInfos[i];
            temp.push({
                label: buddy.name,
                value: buddy.uuid
            });
            if (i % 4 === 0) {
                buddySelectMenus.push(
                    new KRow().setComponents(
                        new KStringSelectMenu()
                            .setCustomId("valorant_wishlist_buddy")
                            .setPlaceholder("Select a buddy")
                            .addOptions(temp)
                    )
                );
            }
        }

        wishlistInfo.set("buddies", {
            embeds: buddyEmbeds,
            selectMenus: buddySelectMenus
        });

        const cardSelectMenus = [];
        temp = [];

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            temp.push({
                label: card.displayName,
                value: card.uuid
            });
            if (i % 4 === 0) {
                cardSelectMenus.push(
                    new KRow().setComponents(
                        new KStringSelectMenu()
                            .setCustomId("valorant_wishlist_card")
                            .setPlaceholder("Select a card")
                            .addOptions(temp)
                    )
                );
            }
        }

        wishlistInfo.set("cards", {
            embeds: cardEmbeds,
            selectMenus: cardSelectMenus
        });

        const spraySelectMenus = [];
        temp = [];

        for (let i = 0; i < sprayInfos.length; i++) {
            const spray = sprayInfos[i];
            temp.push({
                label: spray.name,
                value: spray.uuid
            });
            if (i % 4 === 0) {
                spraySelectMenus.push(
                    new KRow().setComponents(
                        new KStringSelectMenu()
                            .setCustomId("valorant_wishlist_spray")
                            .setPlaceholder("Select a spray")
                            .addOptions(temp)
                    )
                );
            }
        }

        wishlistInfo.set("sprays", {
            embeds: sprayEmbeds,
            selectMenus: spraySelectMenus
        });

        const titleSelectMenus = [];
        temp = [];

        for (let i = 0; i < titles.length; i++) {
            const title = titles[i];
            temp.push({
                label: title.displayName,
                value: title.uuid
            });
            if (i % 4 === 0) {
                titleSelectMenus.push(
                    new KRow().setComponents(
                        new KStringSelectMenu()
                            .setCustomId("valorant_wishlist_title")
                            .setPlaceholder("Select a title")
                            .addOptions(temp)
                    )
                );
            }
        }

        wishlistInfo.set("titles", {
            embeds: titleEmbeds,
            selectMenus: titleSelectMenus
        });

        const chooseTypeButtons = new KRow().setComponents(
            new KButton()
                .setCustomId("valorant_wishlist_skins")
                .setLabel("Skins")
                .setStyle(ButtonStyle.Danger),
            new KButton()
                .setCustomId("valorant_wishlist_sprays")
                .setLabel("Sprays")
                .setStyle(ButtonStyle.Success),
            new KButton()
                .setCustomId("valorant_wishlist_buddies")
                .setLabel("Buddies")
                .setStyle(ButtonStyle.Primary),
            new KButton()
                .setCustomId("valorant_wishlist_cards")
                .setLabel("Cards")
                .setStyle(ButtonStyle.Secondary),
            new KButton()
                .setCustomId("valorant_wishlist_titles")
                .setLabel("Titles")
                .setStyle(ButtonStyle.Primary)
        );

        const navButtons = new KRow().setComponents(
            new KButton()
                .setCustomId("previous_page")
                .setEmoji(emojis.get("left_arrow") ?? "⬅️")
                .setStyle(ButtonStyle.Secondary),
            new KButton()
                .setCustomId("next_page")
                .setLabel("Next")
                .setEmoji(emojis.get("right_arrow") ?? "➡️")
                .setStyle(ButtonStyle.Secondary)
        );

        const currentSelection = "skins";

        let mainEmbed = await valorant.util.wishlistCard(
            user,
            valDb.privacy.wishlist,
            currentSelection
        );

        const currentInfo = wishlistInfo.get(currentSelection);

        if (!currentInfo) return;

        const wishlistMenu = currentInfo.selectMenus;
        const embeds = currentInfo.embeds;

        let currentPage = 0;

        let currentEmbeds = embeds.slice(currentPage, currentPage + 4);
        let currentMenu = wishlistMenu[currentPage];

        const message = await interaction.editReply({
            content: null,
            embeds: [mainEmbed, ...currentEmbeds],
            components:
                embeds.length <= 4
                    ? [currentMenu, chooseTypeButtons]
                    : [navButtons, currentMenu, chooseTypeButtons]
        });

        if (embeds.length > 4) {
            const navCollector = message.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 0,
                filter: (i) =>
                    i.user.id === user.id &&
                    (i.customId === "next_page" ||
                        i.customId === "previous_page")
            });

            navCollector.on("collect", async (i) => {
                if (i.customId === "previous_page") {
                    currentPage -= 1;
                    if (currentPage < 0) currentPage = 0;
                } else if (i.customId === "next_page") {
                    currentPage += 1;
                    if (currentPage > embeds.length)
                        currentPage = embeds.length;
                }

                mainEmbed = await valorant.util.wishlistCard(
                    user,
                    valDb.privacy.wishlist,
                    currentSelection
                );
                currentEmbeds = embeds.slice(currentPage, currentPage + 4);
                currentMenu = wishlistMenu[currentPage];

                //console.log(wishlistMenu);
                //console.log(currentMenu.components[0]);

                await i.update({
                    embeds: [mainEmbed, ...currentEmbeds],
                    components:
                        currentEmbeds.length <= 4
                            ? [currentMenu, chooseTypeButtons]
                            : [navButtons, currentMenu, chooseTypeButtons]
                });
            });
        }

        const typeSelectCollector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 0,
            filter: (i) =>
                i.user.id === user.id &&
                i.customId.startsWith("valorant_wishlist")
        });

        typeSelectCollector.on("collect", async (i) => {
            const type = i.customId.split("_")[2];
            const info = wishlistInfo.get(type);

            if (!info) return;

            const embeds = info.embeds;
            const menus = info.selectMenus;

            if (embeds.length === 0) {
                i.reply({
                    content: `**😢 No ${capitalize(type)} items in ${
                        userId === user.id ? "your" : `${user.globalName}'s`
                    } wishlist**`,
                    ephemeral: true
                });
                return;
            }

            currentPage = 0;

            mainEmbed = await valorant.util.wishlistCard(
                user,
                valDb.privacy.wishlist,
                type
            );
            currentEmbeds = embeds.slice(currentPage, currentPage + 4);
            currentMenu = menus[currentPage];

            await i.update({
                embeds: [mainEmbed, ...currentEmbeds],
                components:
                    currentEmbeds.length <= 4
                        ? [currentMenu, chooseTypeButtons]
                        : [navButtons, currentMenu, chooseTypeButtons]
            });
        });
    }

    async addSkinCommand(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction;

        const item = options.getString("valorant_skin_name_wishlist", true);

        const skin = this.valorant.skins.getByID(item);
        if (!skin) return interaction.reply("That skin does not exist.");

        const added = await this.add(user, skin, "skin");
        if (!added)
            return interaction.reply({
                content: `**${skin.displayName}** is already in your wishlist.`,
                ephemeral: true
            });

        interaction.reply({
            content: `Added **${skin.displayName}** to your wishlist!`,
            ephemeral: true
        });
    }

    async addBuddyCommand(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction;

        const item = options.getString("valorant_buddy_name_wishlist", true);

        const buddy = this.valorant.buddies.getByID(item);
        if (!buddy) return interaction.reply("That buddy does not exist.");

        const added = await this.add(user, buddy, "buddy");
        if (!added)
            return interaction.reply({
                content: `**${buddy.displayName}** is already in your wishlist.`,
                ephemeral: true
            });

        interaction.reply({
            content: `Added **${buddy.displayName}** to your wishlist!`,
            ephemeral: true
        });
    }

    async addCardCommand(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction;

        const item = options.getString("valorant_card_name_wishlist", true);

        const card = this.valorant.playerCards.getByID(item);
        if (!card) return interaction.reply("That card does not exist.");

        const added = await this.add(user, card, "card");
        if (!added)
            return interaction.reply({
                content: `**${card.displayName}** is already in your wishlist.`,
                ephemeral: true
            });

        interaction.reply({
            content: `Added **${card.displayName}** to your wishlist!`,
            ephemeral: true
        });
    }

    async addSprayCommand(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction;

        const item = options.getString("valorant_spray_name_wishlist", true);

        const spray = this.valorant.sprays.getByID(item);
        if (!spray) return interaction.reply("That spray does not exist.");

        const added = await this.add(user, spray, "spray");
        if (!added)
            return interaction.reply({
                content: `**${spray.displayName}** is already in your wishlist.`,
                ephemeral: true
            });

        interaction.reply({
            content: `Added **${spray.displayName}** to your wishlist!`,
            ephemeral: true
        });
    }

    async addTitleCommand(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction;

        const item = options.getString("valorant_title_name_wishlist", true);

        const title = this.valorant.playerTitles.getByID(item);
        if (!title) return interaction.reply("That title does not exist.");

        const added = await this.add(user, title, "title");
        if (!added)
            return interaction.reply({
                content: `**${title.displayName}** is already in your wishlist.`,
                ephemeral: true
            });

        interaction.reply({
            content: `Added **${title.displayName}** to your wishlist!`,
            ephemeral: true
        });
    }

    async removeSkinCommand(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction;

        const item = options.getString("your_wishlist_skin", true);

        const skin = this.valorant.skins.getByID(item);
        if (!skin) return interaction.reply("That skin does not exist.");

        const removed = await this.remove(user, skin);
        if (!removed)
            return interaction.reply({
                content: `**${skin.displayName}** is not in your wishlist.`,
                ephemeral: true
            });

        interaction.reply({
            content: `Removed **${skin.displayName}** from your wishlist!`,
            ephemeral: true
        });
    }

    async removeBuddyCommand(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction;

        const item = options.getString("your_wishlist_buddy", true);

        const buddy = this.valorant.buddies.getByID(item);
        if (!buddy) return interaction.reply("That buddy does not exist.");

        const removed = await this.remove(user, buddy);
        if (!removed)
            return interaction.reply({
                content: `${buddy.displayName} is not in your wishlist.`,
                ephemeral: true
            });

        interaction.reply({
            content: `Removed **${buddy.displayName}** from your wishlist!`,
            ephemeral: true
        });
    }

    async removeCardCommand(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction;

        const item = options.getString("your_wishlist_card", true);

        const card = this.valorant.playerCards.getByID(item);
        if (!card) return interaction.reply("That card does not exist.");

        const removed = await this.remove(user, card);
        if (!removed)
            return interaction.reply({
                content: `**${card.displayName}** is not in your wishlist.`,
                ephemeral: true
            });

        interaction.reply({
            content: `Removed **${card.displayName}** from your wishlist!`,
            ephemeral: true
        });
    }

    async removeSprayCommand(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction;

        const item = options.getString("your_wishlist_spray", true);

        const spray = this.valorant.sprays.getByID(item);
        if (!spray) return interaction.reply("That spray does not exist.");

        const removed = await this.remove(user, spray);
        if (!removed)
            return interaction.reply({
                content: `**${spray.displayName}** is not in your wishlist.`,
                ephemeral: true
            });

        interaction.reply({
            content: `Removed **${spray.displayName}** from your wishlist!`,
            ephemeral: true
        });
    }

    async removeTitleCommand(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction;

        const item = options.getString("your_wishlist_title", true);

        const title = this.valorant.playerTitles.getByID(item);
        if (!title) return interaction.reply("That title does not exist.");

        const removed = await this.remove(user, title);
        if (!removed)
            return interaction.reply({
                content: `**${title.displayName}** is not in your wishlist.`,
                ephemeral: true
            });

        interaction.reply({
            content: `Removed **${title.displayName}** from your wishlist!`,
            ephemeral: true
        });
    }

    async add(
        user: User,
        item:
            | IValorantWeaponSkin
            | IValorantBuddy
            | IValorantPlayerCard
            | IValorantSpray
            | IValorantPlayerTitle,
        type: "skin" | "buddy" | "card" | "spray" | "title"
    ) {
        const { database, logger } = kuramisa;

        const db = await database.users.fetch(user.id);
        const { valorant } = db;

        if (
            valorant.wishlist.some(
                (wishlistItem) => wishlistItem.uuid === item.uuid
            )
        )
            return false;

        valorant.wishlist.push({
            uuid: item.uuid,
            type
        });

        await db.save();

        logger.debug(
            `Added ${item.displayName} to ${user.globalName}'s wishlist`
        );

        return true;
    }

    async remove(
        user: User,
        item:
            | IValorantWeaponSkin
            | IValorantBuddy
            | IValorantPlayerCard
            | IValorantSpray
            | IValorantPlayerTitle
    ) {
        const { database, logger } = kuramisa;

        const db = await database.users.fetch(user.id);
        const { valorant } = db;

        if (!valorant.wishlist.filter((it) => it.uuid === item.uuid))
            return false;

        valorant.wishlist = valorant.wishlist.filter(
            (wishlistItem) => wishlistItem.uuid !== item.uuid
        );

        await db.save();

        logger.debug(
            `Removed ${item.displayName} from ${user.globalName}'s wishlist`
        );

        return true;
    }
}
