/* eslint-disable @typescript-eslint/no-unused-vars */
import { container } from "@sapphire/framework";
import Valorant from "./index";
import { ButtonStyle, ChatInputCommandInteraction, User } from "discord.js";

export default class ValorantWishlist {
    private readonly valorant: Valorant;

    constructor(valorant: Valorant) {
        this.valorant = valorant;
    }

    async wishlistView(interaction: ChatInputCommandInteraction) {
        const { database, util } = container;
        const { options, user } = interaction;
        const { valorant } = this;

        if (!container.owners.some((owner) => owner.id === user.id))
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

        const mainEmbed = await valorant.util.wishlistCard(
            user,
            valDb.privacy.wishlist
        );

        const skinEmbeds = [];
        const skinInfos = [];
        for (const skin of skins) {
            const skinInfo = valorant.skins.info(skin);
            if (!skinInfo) continue;
            skinInfos.push(skinInfo);
            skinEmbeds.push(
                util
                    .embed()
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
                util
                    .embed()
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
                util
                    .embed()
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

        const chooseTypeButtons = util
            .row()
            .setComponents(
                util
                    .button()
                    .setCustomId("valorant_wishlist_skins")
                    .setLabel("Skins")
                    .setStyle(ButtonStyle.Danger),
                util
                    .button()
                    .setCustomId("valorant_wishlist_sprays")
                    .setLabel("Sprays")
                    .setStyle(ButtonStyle.Success),
                util
                    .button()
                    .setCustomId("valorant_wishlist_buddies")
                    .setLabel("Buddies")
                    .setStyle(ButtonStyle.Primary),
                util
                    .button()
                    .setCustomId("valorant_wishlist_cards")
                    .setLabel("Cards")
                    .setStyle(ButtonStyle.Secondary),
                util
                    .button()
                    .setCustomId("valorant_wishlist_titles")
                    .setLabel("Titles")
                    .setStyle(ButtonStyle.Primary)
            );

        const addToWishlistButton = util
            .row()
            .setComponents(
                util
                    .button()
                    .setCustomId("add_to_wishlist")
                    .setLabel("Add to Wishlist")
                    .setStyle(ButtonStyle.Success)
            );

        const currentSelection = "skins";

        const viewSelectMenu = util
            .row()
            .setComponents(
                util
                    .stringMenu()
                    .setCustomId(`view_select_menu_${currentSelection}`)
            );

        const currentPage = 0;

        await interaction.editReply({
            content: null,
            embeds: [mainEmbed, skinEmbeds[currentPage]],
            components: [chooseTypeButtons, viewSelectMenu, addToWishlistButton]
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
        const { database, logger } = container;

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
        const { database, logger } = container;

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
    }
}
