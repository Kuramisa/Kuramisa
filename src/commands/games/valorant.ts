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
                                .setDescription("Valorant weapon name")
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
                                .setDescription("Add a skin to your wishlist")
                                .addStringOption((option) =>
                                    option
                                        .setName("valorant_skin_name_wishlist")
                                        .setDescription("Valorant skin name")
                                        .setRequired(true)
                                        .setAutocomplete(true)
                                )
                        )
                        .addSubcommand((command) =>
                            command
                                .setName("buddy")
                                .setDescription("Add a buddy to your wishlist")
                                .addStringOption((option) =>
                                    option
                                        .setName("valorant_buddy_name_wishlist")
                                        .setDescription("Valorant buddy name")
                                        .setRequired(true)
                                        .setAutocomplete(true)
                                )
                        )
                        .addSubcommand((command) =>
                            command
                                .setName("card")
                                .setDescription("Add a card to your wishlist")
                                .addStringOption((option) =>
                                    option
                                        .setName("valorant_card_name_wishlist")
                                        .setDescription("Valorant card name")
                                        .setRequired(true)
                                        .setAutocomplete(true)
                                )
                        )
                        .addSubcommand((command) =>
                            command
                                .setName("spray")
                                .setDescription("Add a spray to your wishlist")
                                .addStringOption((option) =>
                                    option
                                        .setName("valorant_spray_name_wishlist")
                                        .setDescription("Valorant spray name")
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
                                    "Remove a skin from your wishlist"
                                )
                                .addStringOption((option) =>
                                    option
                                        .setName("your_wishlist_skin")
                                        .setDescription("Valorant skin name")
                                        .setRequired(true)
                                        .setAutocomplete(true)
                                )
                        )
                        .addSubcommand((command) =>
                            command
                                .setName("buddy")
                                .setDescription(
                                    "Remove a buddy from your wishlist"
                                )
                                .addStringOption((option) =>
                                    option
                                        .setName("your_wishlist_buddy")
                                        .setDescription("Valorant buddy name")
                                        .setRequired(true)
                                        .setAutocomplete(true)
                                )
                        )
                        .addSubcommand((command) =>
                            command
                                .setName("card")
                                .setDescription(
                                    "Remove a card from your wishlist"
                                )
                                .addStringOption((option) =>
                                    option
                                        .setName("your_wishlist_card")
                                        .setDescription("Valorant card name")
                                        .setRequired(true)
                                        .setAutocomplete(true)
                                )
                        )
                        .addSubcommand((command) =>
                            command
                                .setName("spray")
                                .setDescription(
                                    "Remove a spray from your wishlist"
                                )
                                .addStringOption((option) =>
                                    option
                                        .setName("your_wishlist_spray")
                                        .setDescription("Valorant spray name")
                                        .setRequired(true)
                                        .setAutocomplete(true)
                                )
                        )
                )
                .addSubcommand((command) =>
                    command
                        .setName("wishlist")
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
                    default: {
                    }
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
                    case "wishlist":
                        await valorant.wishlist.view(interaction);
                        break;
                    case "agents": {
                        const agentId = options.getString(
                            "valorant_agent_name",
                            true
                        );
                        const agent = valorant.agents.getByID(agentId);
                        if (!agent)
                            return interaction.reply({
                                content: "**😲 Agent not found!**",
                                ephemeral: true,
                            });
                        const agentEmbed = valorant.agents.embed(agent);
                        return interaction.reply({ embeds: [agentEmbed] });
                    }
                    case "skins": {
                        const weaponId = options.getString(
                            "valorant_weapon_name",
                            true
                        );
                        const weapon = valorant.weapons.getByID(weaponId);
                        if (!weapon)
                            return interaction.reply({
                                content: "**😲 Weapon not found!**",
                                ephemeral: true,
                            });

                        const skins = weapon.skins
                            .filter((skin) => skin.contentTierUuid)
                            .sort((a, b) =>
                                a.displayName.localeCompare(b.displayName)
                            );

                        await interaction.deferReply();

                        const infoCollection = valorant.skins.collection(skins);

                        let page = 0;
                        let levelPage = 0;

                        const skin = infoCollection.at(page);
                        if (!skin) return;

                        const message = await interaction.editReply({
                            embeds: [skin.level.embeds[0]],
                            components: valorant.util.determineComponents(
                                skin,
                                true
                            ),
                        });

                        const buttonNames = [
                            "previous_skin",
                            "next_skin",
                            "add_to_wishlist",
                        ];

                        const buttonCollector =
                            message.createMessageComponentCollector({
                                filter: (i) =>
                                    i.user.id === interaction.user.id &&
                                    (buttonNames.includes(i.customId) ||
                                        i.customId.includes(
                                            "valorant_skin_chroma"
                                        )),
                                componentType: ComponentType.Button,
                            });

                        const menuCollector =
                            message.createMessageComponentCollector({
                                filter: (i) =>
                                    i.user.id === interaction.user.id &&
                                    i.customId ===
                                        "valorant_weapon_skin_level_select",
                                componentType: ComponentType.StringSelect,
                            });

                        buttonCollector.on("collect", async (i) => {
                            switch (i.customId) {
                                case "previous_skin": {
                                    page =
                                        page > 0 ? --page : infoCollection.size;
                                    levelPage = 0;
                                    break;
                                }
                                case "next_skin": {
                                    page =
                                        page + 1 < infoCollection.size
                                            ? ++page
                                            : 0;
                                    levelPage = 0;
                                    break;
                                }
                                case "add_to_wishlist": {
                                    await i.reply({
                                        content: "**😁 Coming Soon™️!**",
                                        ephemeral: true,
                                    });
                                    return;
                                }
                            }

                            if (i.customId.includes("valorant_skin_chroma")) {
                                const skin = infoCollection.at(page);
                                if (!skin) return;
                                const chromaPage = parseInt(
                                    i.customId.split("_")[3]
                                );
                                if (isNaN(chromaPage)) return;

                                await valorant.util.updateInfoChroma(
                                    i,
                                    skin,
                                    chromaPage,
                                    true
                                );
                                return;
                            }

                            const skin = infoCollection.at(page);
                            if (!skin) return;

                            await valorant.util.updateInfoLevel(
                                i,
                                skin,
                                levelPage,
                                true
                            );
                        });

                        menuCollector.on("collect", async (i) => {
                            levelPage = parseInt(i.values[0]);
                            const skin = infoCollection.at(page);
                            if (!skin) return;
                            await valorant.util.updateInfoLevel(
                                i,
                                skin,
                                levelPage,
                                true
                            );
                        });

                        break;
                    }
                    case "skin": {
                        const skinId = options.getString(
                            "valorant_skin_name",
                            true
                        );
                        const skin = valorant.skins.getByID(skinId);
                        if (!skin)
                            return interaction.reply({
                                content: "**😲 Skin not found!**",
                                ephemeral: true,
                            });
                        const skinInfo = valorant.skins.info(skin);
                        await valorant.util.createSkinCollectors(
                            interaction,
                            skinInfo
                        );
                        break;
                    }
                    case "weapons": {
                        const weaponId = options.getString(
                            "valorant_weapon_name",
                            true
                        );
                        const weapon = valorant.weapons.getByID(weaponId);
                        if (!weapon)
                            return interaction.reply({
                                content: "**😲 Weapon not found!**",
                                ephemeral: true,
                            });
                        const weaponEmbed = valorant.weapons.embed(weapon);
                        const weaponRow = valorant.weapons.row(weapon);
                        return interaction.reply({
                            embeds: [weaponEmbed],
                            components: [weaponRow],
                        });
                    }
                }
            }
        }
    }
}
