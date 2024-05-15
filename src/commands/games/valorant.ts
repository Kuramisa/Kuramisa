import { KStringOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import { ChatInputCommandInteraction } from "discord.js";

@SlashCommand({
    name: "valorant",
    description: "VALORANT Commands",
    subcommands: [
        {
            name: "login",
            description: "Login to your VALORANT account",
            options: [
                new KStringOption()
                    .setName("val_username")
                    .setDescription("Your VALORANT Username")
                    .setRequired(true),
                new KStringOption()
                    .setName("val_password")
                    .setDescription("Your VALORANT Password")
                    .setRequired(true)
            ]
        },
        {
            name: "logout",
            description: "Logout from your VALORANT account(s)",
            options: [
                new KStringOption()
                    .setName("your_val_account")
                    .setDescription("Your Valorant Account")
                    .setRequired(false)
                    .setAutocomplete(true)
            ]
        },
        {
            name: "agents",
            description: "Get information about VALORANT agents",
            options: [
                new KStringOption()
                    .setName("valorant_agent_name")
                    .setDescription("Valorant agent name")
                    .setRequired(true)
                    .setAutocomplete(true)
            ]
        },
        {
            name: "skins",
            description: "Get information about VALORANT skins",
            options: [
                new KStringOption()
                    .setName("valorant_weapon_name")
                    .setDescription("Valorant weapon name")
                    .setRequired(true)
                    .setAutocomplete(true)
            ]
        },
        {
            name: "skin",
            description: "Get information about a specific VALORANT skin",
            options: [
                new KStringOption()
                    .setName("valorant_skin_name")
                    .setDescription("Valorant skin name")
                    .setRequired(true)
                    .setAutocomplete(true)
            ]
        },
        {
            name: "weapons",
            description: "Get information about VALORANT weapons",
            options: [
                new KStringOption()
                    .setName("valorant_weapon_name")
                    .setDescription("Valorant weapon name")
                    .setRequired(true)
                    .setAutocomplete(true)
            ]
        },
        {
            name: "privacy",
            description: "Get information about VALORANT privacy",
            options: [
                new KStringOption()
                    .setName("valorant_privacy_setting")
                    .setDescription("Valorant privacy setting")
                    .setRequired(true)
                    .setAutocomplete(true),
                new KStringOption()
                    .setName("valorant_privacy_value")
                    .setDescription("Valorant privacy value")
                    .setRequired(true)
                    .setChoices(
                        { name: "Public", value: "public" },
                        { name: "Private", value: "private" }
                    )
            ]
        },
        {
            name: "wishlist-view",
            description: "View your/someone's Valorant wishlist",
            options: [
                new KStringOption()
                    .setName("valorant_player")
                    .setDescription(
                        "The Valorant player to view the wishlist of"
                    )
                    .setRequired(false)
                    .setAutocomplete(true)
            ]
        }
    ],
    groups: [
        {
            name: "market",
            description: "Access VALORANT market",
            subcommands: [
                {
                    name: "daily",
                    description:
                        "View your/another player's Daily VALORANT Market",
                    options: [
                        new KStringOption()
                            .setName("valorant_player")
                            .setDescription(
                                "The Valorant player to view the shop of"
                            )
                            .setRequired(false)
                            .setAutocomplete(true)
                    ]
                },
                {
                    name: "featured",
                    description: "View VALORANT featured shop"
                }
            ]
        },
        {
            name: "wishlist-add",
            description: "Add Valorant items to your VALORANT wishlist",
            subcommands: [
                {
                    name: "skin",
                    description: "Add a skin to your VALORANT wishlist",
                    options: [
                        new KStringOption()
                            .setName("valorant_skin_name_wishlist")
                            .setDescription("Valorant skin name")
                            .setRequired(true)
                            .setAutocomplete(true)
                    ]
                },
                {
                    name: "buddy",
                    description: "Add a buddy to your VALORANT wishlist",
                    options: [
                        new KStringOption()
                            .setName("valorant_buddy_name_wishlist")
                            .setDescription("Valorant buddy name")
                            .setRequired(true)
                            .setAutocomplete(true)
                    ]
                },
                {
                    name: "card",
                    description: "Add a card to your VALORANT wishlist",
                    options: [
                        new KStringOption()
                            .setName("valorant_card_name_wishlist")
                            .setDescription("Valorant card name")
                            .setRequired(true)
                            .setAutocomplete(true)
                    ]
                },
                {
                    name: "spray",
                    description: "Add a spray to your VALORANT wishlist",
                    options: [
                        new KStringOption()
                            .setName("valorant_spray_name_wishlist")
                            .setDescription("Valorant spray name")
                            .setRequired(true)
                            .setAutocomplete(true)
                    ]
                },
                {
                    name: "title",
                    description: "Add a title to your VALORANT wishlist",
                    options: [
                        new KStringOption()
                            .setName("valorant_title_name_wishlist")
                            .setDescription("Valorant title name")
                            .setRequired(true)
                            .setAutocomplete(true)
                    ]
                }
            ]
        },
        {
            name: "wishlist-remove",
            description: "Remove Valorant items from your VALORANT wishlist",
            subcommands: [
                {
                    name: "skin",
                    description: "Remove a skin from your VALORANT wishlist",
                    options: [
                        new KStringOption()
                            .setName("valorant_skin_name_wishlist")
                            .setDescription("Valorant skin name")
                            .setRequired(true)
                            .setAutocomplete(true)
                    ]
                },
                {
                    name: "buddy",
                    description: "Remove a buddy from your VALORANT wishlist",
                    options: [
                        new KStringOption()
                            .setName("valorant_buddy_name_wishlist")
                            .setDescription("Valorant buddy name")
                            .setRequired(true)
                            .setAutocomplete(true)
                    ]
                },
                {
                    name: "card",
                    description: "Remove a card from your VALORANT wishlist",
                    options: [
                        new KStringOption()
                            .setName("valorant_card_name_wishlist")
                            .setDescription("Valorant card name")
                            .setRequired(true)
                            .setAutocomplete(true)
                    ]
                },
                {
                    name: "spray",
                    description: "Remove a spray from your VALORANT wishlist",
                    options: [
                        new KStringOption()
                            .setName("valorant_spray_name_wishlist")
                            .setDescription("Valorant spray name")
                            .setRequired(true)
                            .setAutocomplete(true)
                    ]
                },
                {
                    name: "title",
                    description: "Remove a title from your VALORANT wishlist",
                    options: [
                        new KStringOption()
                            .setName("valorant_title_name_wishlist")
                            .setDescription("Valorant title name")
                            .setRequired(true)
                            .setAutocomplete(true)
                    ]
                }
            ]
        }
    ]
})
export default class ValorantCommand extends AbstractSlashCommand {
    async slashLogin(interaction: ChatInputCommandInteraction) {
        const { user } = interaction;
        const { valorant } = this.client.games;

        if (!valorant.accounts.get(user.id))
            await valorant.loadAccounts(user.id);

        valorant.auth.login(interaction);
    }

    async slashLogout(interaction: ChatInputCommandInteraction) {
        const { valorant } = this.client.games;

        if (!(await valorant.util.isAuthed(interaction))) return;
        valorant.auth.logout(interaction);
    }

    async slashAgents(interaction: ChatInputCommandInteraction) {
        this.client.games.valorant.agentsCommand(interaction);
    }

    async slashSkins(interaction: ChatInputCommandInteraction) {
        this.client.games.valorant.skinsCommand(interaction);
    }

    async slashSkin(interaction: ChatInputCommandInteraction) {
        this.client.games.valorant.skinCommand(interaction);
    }

    async slashWeapons(interaction: ChatInputCommandInteraction) {
        this.client.games.valorant.weaponsCommand(interaction);
    }

    async slashPrivacy(interaction: ChatInputCommandInteraction) {
        this.client.games.valorant.privacy(interaction);
    }

    async slashMarketFeatured(interaction: ChatInputCommandInteraction) {
        this.client.games.valorant.shop.featured(interaction);
    }

    async slashMarketDaily(interaction: ChatInputCommandInteraction) {
        const { valorant } = this.client.games;

        if (!(await valorant.util.isAuthed(interaction))) return;
        await valorant.shop.daily(interaction);
    }

    async slashWishlistAddSkin(interaction: ChatInputCommandInteraction) {
        const { valorant } = this.client.games;

        if (!(await valorant.util.isAuthed(interaction))) return;
        await valorant.wishlist.addSkinCommand(interaction);
    }

    async slashWishlistAddBuddy(interaction: ChatInputCommandInteraction) {
        const { valorant } = this.client.games;

        if (!(await valorant.util.isAuthed(interaction))) return;
        await valorant.wishlist.addBuddyCommand(interaction);
    }

    async slashWishlistAddCard(interaction: ChatInputCommandInteraction) {
        const { valorant } = this.client.games;

        if (!(await valorant.util.isAuthed(interaction))) return;
        await valorant.wishlist.addCardCommand(interaction);
    }

    async slashWishlistAddSpray(interaction: ChatInputCommandInteraction) {
        const { valorant } = this.client.games;

        if (!(await valorant.util.isAuthed(interaction))) return;
        await valorant.wishlist.addSprayCommand(interaction);
    }

    async slashWishlistAddTitle(interaction: ChatInputCommandInteraction) {
        const { valorant } = this.client.games;

        if (!(await valorant.util.isAuthed(interaction))) return;
        await valorant.wishlist.addTitleCommand(interaction);
    }

    async slashWishlistRemoveSkin(interaction: ChatInputCommandInteraction) {
        const { valorant } = this.client.games;

        if (!(await valorant.util.isAuthed(interaction))) return;
        await valorant.wishlist.removeSkinCommand(interaction);
    }

    async slashWishlistRemoveBuddy(interaction: ChatInputCommandInteraction) {
        const { valorant } = this.client.games;

        if (!(await valorant.util.isAuthed(interaction))) return;
        await valorant.wishlist.removeBuddyCommand(interaction);
    }

    async slashWishlistRemoveCard(interaction: ChatInputCommandInteraction) {
        const { valorant } = this.client.games;

        if (!(await valorant.util.isAuthed(interaction))) return;
        await valorant.wishlist.removeCardCommand(interaction);
    }

    async slashWishlistRemoveSpray(interaction: ChatInputCommandInteraction) {
        const { valorant } = this.client.games;

        if (!(await valorant.util.isAuthed(interaction))) return;
        await valorant.wishlist.removeSprayCommand(interaction);
    }

    async slashWishlistRemoveTitle(interaction: ChatInputCommandInteraction) {
        const { valorant } = this.client.games;

        if (!(await valorant.util.isAuthed(interaction))) return;
        await valorant.wishlist.removeTitleCommand(interaction);
    }

    async slashWishlistView(interaction: ChatInputCommandInteraction) {
        const { valorant } = this.client.games;

        if (!(await valorant.util.isAuthed(interaction))) return;
        await valorant.wishlist.wishlistView(interaction);
    }
}
