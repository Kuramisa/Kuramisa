import { Command } from "@sapphire/framework";
import { ComponentType } from "discord.js";

export class ValorantCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "valorant",
            description: "Valorant commands",
        });
    }

    override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addSubcommand((command) =>
                    command
                        .setName("login")
                        .setDescription("Login to your valorant account")
                        .addStringOption((option) =>
                            option
                                .setName("val_username")
                                .setDescription("Your valorant username")
                                .setRequired(true)
                        )
                        .addStringOption((option) =>
                            option
                                .setName("val_password")
                                .setDescription("Your valorant password")
                                .setRequired(true)
                        )
                )
                .addSubcommand((command) =>
                    command
                        .setName("logout")
                        .setDescription("Logout from your valorant account(s)")
                        .addStringOption((option) =>
                            option
                                .setName("your_val_account")
                                .setDescription("Your Valorant Account")
                                .setRequired(false)
                                .setAutocomplete(true)
                        )
                )
                .addSubcommand((command) =>
                    command
                        .setName("agents")
                        .setDescription("Get info about valorant agents")
                        .addStringOption((option) =>
                            option
                                .setName("valorant_agent_name")
                                .setDescription("Valorant agent name")
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
                )
                .addSubcommand((command) =>
                    command
                        .setName("skins")
                        .setDescription(
                            "Get info about valorant skins for a certain weapon"
                        )
                        .addStringOption((option) =>
                            option
                                .setName("valorant_weapon_name")
                                .setDescription("Valorant weapon name")
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
                )
                .addSubcommand((command) =>
                    command
                        .setName("skin")
                        .setDescription("Get info about a valorant skin")
                        .addStringOption((option) =>
                            option
                                .setName("valorant_skin_name")
                                .setDescription("Valorant skin name")
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
                )
                .addSubcommand((command) =>
                    command
                        .setName("weapons")
                        .setDescription("Get info about valorant weapons")
                        .addStringOption((option) =>
                            option
                                .setName("valorant_weapon_name")
                                .setDescription("Valorant Weapon name")
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
                )
                .addSubcommandGroup((group) =>
                    group
                        .setName("market")
                        .setDescription("View Valorant Market")
                        .addSubcommand((command) =>
                            command
                                .setName("daily")
                                .setDescription(
                                    "View your/another player's Daily Valorant Market"
                                )
                                .addStringOption((option) =>
                                    option
                                        .setName("valorant_player")
                                        .setDescription(
                                            "The Valorant player to view the shop of"
                                        )
                                        .setRequired(false)
                                        .setAutocomplete(true)
                                )
                        )
                        .addSubcommand((command) =>
                            command
                                .setName("featured")
                                .setDescription("View Featured Valorant Market")
                        )
                )
                .addSubcommand((command) =>
                    command
                        .setName("privacy")
                        .setDescription("Change your valorant privacy settings")
                        .addStringOption((option) =>
                            option
                                .setName("valorant_privacy_setting")
                                .setDescription("Valorant privacy setting")
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
                        .addStringOption((option) =>
                            option
                                .setName("valorant_privacy_value")
                                .setDescription("Valorant privacy value")
                                .setRequired(true)
                                .setChoices(
                                    { name: "Public", value: "public" },
                                    { name: "Private", value: "private" }
                                )
                        )
                )
                .addSubcommandGroup((group) =>
                    group
                        .setName("wishlist_add")
                        .setDescription("Add Valorant items to your wishlist")
                        .addSubcommand((command) =>
                            command
                                .setName("skin")
                                .setDescription("Add a Skin to your wishlist")
                                .addStringOption((option) =>
                                    option
                                        .setName("valorant_skin_name_wishlist")
                                        .setDescription("Valorant Skin name")
                                        .setRequired(true)
                                        .setAutocomplete(true)
                                )
                        )
                        .addSubcommand((command) =>
                            command
                                .setName("buddy")
                                .setDescription(
                                    "Add a Gun Buddy to your wishlist"
                                )
                                .addStringOption((option) =>
                                    option
                                        .setName("valorant_buddy_name_wishlist")
                                        .setDescription(
                                            "Valorant Gun Buddy name"
                                        )
                                        .setRequired(true)
                                        .setAutocomplete(true)
                                )
                        )
                        .addSubcommand((command) =>
                            command
                                .setName("card")
                                .setDescription(
                                    "Add a Player Card to your wishlist"
                                )
                                .addStringOption((option) =>
                                    option
                                        .setName("valorant_card_name_wishlist")
                                        .setDescription(
                                            "Valorant Player Card name"
                                        )
                                        .setRequired(true)
                                        .setAutocomplete(true)
                                )
                        )
                        .addSubcommand((command) =>
                            command
                                .setName("spray")
                                .setDescription("Add a Spray to your wishlist")
                                .addStringOption((option) =>
                                    option
                                        .setName("valorant_spray_name_wishlist")
                                        .setDescription("Valorant Spray name")
                                        .setRequired(true)
                                        .setAutocomplete(true)
                                )
                        )
                        .addSubcommand((command) =>
                            command
                                .setName("title")
                                .setDescription(
                                    "Add a Player Title to your wishlist"
                                )
                                .addStringOption((option) =>
                                    option
                                        .setName("valorant_title_name_wishlist")
                                        .setDescription(
                                            "Valorant Player Title name"
                                        )
                                        .setRequired(true)
                                        .setAutocomplete(true)
                                )
                        )
                )
                .addSubcommandGroup((group) =>
                    group
                        .setName("wishlist_remove")
                        .setDescription(
                            "Remove Valorant items from your wishlist"
                        )
                        .addSubcommand((command) =>
                            command
                                .setName("skin")
                                .setDescription(
                                    "Remove a Skin from your wishlist"
                                )
                                .addStringOption((option) =>
                                    option
                                        .setName("your_wishlist_skin")
                                        .setDescription("Valorant Skin name")
                                        .setRequired(true)
                                        .setAutocomplete(true)
                                )
                        )
                        .addSubcommand((command) =>
                            command
                                .setName("buddy")
                                .setDescription(
                                    "Remove a Gun Buddy from your wishlist"
                                )
                                .addStringOption((option) =>
                                    option
                                        .setName("your_wishlist_buddy")
                                        .setDescription(
                                            "Valorant Gun Buddy name"
                                        )
                                        .setRequired(true)
                                        .setAutocomplete(true)
                                )
                        )
                        .addSubcommand((command) =>
                            command
                                .setName("card")
                                .setDescription(
                                    "Remove a Player Card from your wishlist"
                                )
                                .addStringOption((option) =>
                                    option
                                        .setName("your_wishlist_card")
                                        .setDescription(
                                            "Valorant Player Card name"
                                        )
                                        .setRequired(true)
                                        .setAutocomplete(true)
                                )
                        )
                        .addSubcommand((command) =>
                            command
                                .setName("spray")
                                .setDescription(
                                    "Remove a Spray from your wishlist"
                                )
                                .addStringOption((option) =>
                                    option
                                        .setName("your_wishlist_spray")
                                        .setDescription("Valorant Spray name")
                                        .setRequired(true)
                                        .setAutocomplete(true)
                                )
                        )
                        .addSubcommand((command) =>
                            command
                                .setName("title")
                                .setDescription(
                                    "Remove a Player Title from your wishlist"
                                )
                                .addStringOption((option) =>
                                    option
                                        .setName("your_wishlist_title")
                                        .setDescription(
                                            "Valorant Player Title name"
                                        )
                                        .setRequired(true)
                                        .setAutocomplete(true)
                                )
                        )
                )
                .addSubcommand((command) =>
                    command
                        .setName("wishlist_view")
                        .setDescription("View your/someone's Valorant wishlist")
                        .addStringOption((option) =>
                            option
                                .setName("valorant_player")
                                .setDescription("Your Valorant Account")
                                .setRequired(false)
                                .setAutocomplete(true)
                        )
                )
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const { options, user } = interaction;

        const {
            logger,
            games: { valorant },
        } = this.container;

        if (!valorant.initialized)
            return interaction.reply({
                content: "**😲 Valorant is not initialized!**",
                ephemeral: true,
            });

        const neededAuth = [
            "login",
            "logout",
            "daily",
            "privacy",
            "wishlist_add",
            "wishlist_remove",
            "wishlist",
        ];

        const subcommand = options.getSubcommand(true);

        if (
            !valorant.accounts.get(user.id) &&
            neededAuth.includes(options.getSubcommand())
        ) {
            const allDeleted = await valorant.loadAccounts(user.id);
            if (allDeleted && subcommand !== "login")
                return interaction.reply({
                    content:
                        "**😲 Your accounts were removed from the database, because their login expired. Please login again!**\n</valorant login:1172402671345467485>",
                    ephemeral: true,
                });
        }

        if (
            neededAuth.includes(options.getSubcommand()) &&
            subcommand !== "login" &&
            valorant.accounts.get(user.id)!.size < 1
        )
            return interaction.reply({
                content:
                    "**To use this Valorant Feature, you need to login at least to one account. use**\n</valorant login:1172402671345467485>",
                ephemeral: true,
            });

        switch (options.getSubcommandGroup()) {
            case "market":
                switch (subcommand) {
                    case "daily":
                        await valorant.shop.daily(interaction);
                        break;
                    case "featured":
                        await valorant.shop.featured(interaction);
                        break;
                }
                break;
            case "wishlist_add":
                switch (subcommand) {
                    case "skin":
                        await valorant.wishlist.addSkinCommand(interaction);
                        break;
                    case "buddy":
                        await valorant.wishlist.addBuddyCommand(interaction);
                        break;
                    case "card":
                        await valorant.wishlist.addCardCommand(interaction);
                        break;
                    case "spray":
                        await valorant.wishlist.addSprayCommand(interaction);
                        break;
                }
                break;
            case "wishlist_remove":
                switch (subcommand) {
                    case "skin":
                        await valorant.wishlist.removeSkinCommand(interaction);
                        break;
                    case "buddy":
                        await valorant.wishlist.removeBuddyCommand(interaction);
                        break;
                    case "card":
                        await valorant.wishlist.removeCardCommand(interaction);
                        break;
                    case "spray":
                        await valorant.wishlist.removeSprayCommand(interaction);
                        break;
                }
                break;
            default: {
                switch (subcommand) {
                    case "login":
                        await valorant.auth.login(interaction);
                        break;
                    case "logout":
                        await valorant.auth.logout(interaction);
                        break;
                    case "privacy":
                        await valorant.privacy(interaction);
                        break;
                    case "agents": {
                        await valorant.agentsCommand(interaction);
                        break;
                    }
                    case "skins": {
                        await valorant.skinsCommand(interaction);
                        break;
                    }
                    case "skin": {
                        await valorant.skinCommand(interaction);
                        break;
                    }
                    case "weapons": {
                        await valorant.weaponsCommand(interaction);
                        break;
                    }
                    case "wishlist_view": {
                        await valorant.wishlist.wishlistView(interaction);
                        break;
                    }
                }
            }
        }
    }
}
