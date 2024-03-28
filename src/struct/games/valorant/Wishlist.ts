import { container } from "@sapphire/framework";
import Valorant from "./index";
import { ChatInputCommandInteraction, User } from "discord.js";

export default class ValorantWishlist {
    private readonly valorant: Valorant;

    constructor(valorant: Valorant) {
        this.valorant = valorant;
    }

    async addSkinCommand(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction;

        const item = options.getString("valorant_skin_name", true);

        const skin = this.valorant.skins.getByID(item);
        if (!skin) return interaction.reply("That skin does not exist.");

        const added = await this.add(user, skin, "skin");
        if (!added)
            return interaction.reply({
                content: `**${skin.displayName}** is already in your wishlist.`,
                ephemeral: true,
            });

        interaction.reply({
            content: `Added **${skin.displayName}** to your wishlist!`,
            ephemeral: true,
        });
    }

    async addBuddyCommand(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction;

        const item = options.getString("valorant_buddy_name", true);

        const buddy = this.valorant.buddies.getByID(item);
        if (!buddy) return interaction.reply("That buddy does not exist.");

        const added = await this.add(user, buddy, "buddy");
        if (!added)
            return interaction.reply({
                content: `**${buddy.displayName}** is already in your wishlist.`,
                ephemeral: true,
            });

        interaction.reply({
            content: `Added **${buddy.displayName}** to your wishlist!`,
            ephemeral: true,
        });
    }

    async addCardCommand(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction;

        const item = options.getString("valorant_card_name", true);

        const card = this.valorant.playerCards.getByID(item);
        if (!card) return interaction.reply("That card does not exist.");

        const added = await this.add(user, card, "card");
        if (!added)
            return interaction.reply({
                content: `**${card.displayName}** is already in your wishlist.`,
                ephemeral: true,
            });

        interaction.reply({
            content: `Added **${card.displayName}** to your wishlist!`,
            ephemeral: true,
        });
    }

    async addSprayCommand(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction;

        const item = options.getString("valorant_spray_name", true);

        const spray = this.valorant.sprays.getByID(item);
        if (!spray) return interaction.reply("That spray does not exist.");

        const added = await this.add(user, spray, "spray");
        if (!added)
            return interaction.reply({
                content: `**${spray.displayName}** is already in your wishlist.`,
                ephemeral: true,
            });

        interaction.reply({
            content: `Added **${spray.displayName}** to your wishlist!`,
            ephemeral: true,
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
                ephemeral: true,
            });

        interaction.reply({
            content: `Removed **${skin.displayName}** from your wishlist!`,
            ephemeral: true,
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
                ephemeral: true,
            });

        interaction.reply({
            content: `Removed **${buddy.displayName}** from your wishlist!`,
            ephemeral: true,
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
                ephemeral: true,
            });

        interaction.reply({
            content: `Removed **${card.displayName}** from your wishlist!`,
            ephemeral: true,
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
                ephemeral: true,
            });

        interaction.reply({
            content: `Removed **${spray.displayName}** from your wishlist!`,
            ephemeral: true,
        });
    }

    async view(interaction: ChatInputCommandInteraction) {}

    async add(
        user: User,
        item:
            | IValorantWeaponSkin
            | IValorantBuddy
            | IValorantPlayerCard
            | IValorantSpray,
        type: "skin" | "buddy" | "card" | "spray"
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
            type,
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
