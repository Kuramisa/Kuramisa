import { Command } from "@sapphire/framework";

export class ValorantCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "valorant",
            description: "Valorant commands",
            preconditions: ["InDevelopment"],
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
                        .setDescription("Get info about valorant skins")
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
                                    {
                                        name: "Friends (Valorant Friends)",
                                        value: "friends",
                                    },
                                    { name: "Private", value: "private" }
                                )
                        )
                )
        );
    }

    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const { options, user } = interaction;

        const {
            games: { valorant },
        } = this.container;

        if (!valorant.initialized)
            return interaction.reply({
                content: "**😲 Valorant is not initialized!**",
                ephemeral: true,
            });

        const neededAuth = ["login", "logout", "market", "privacy"];

        if (
            !valorant.accounts.get(user.id) &&
            neededAuth.includes(
                options.getSubcommandGroup() ?? options.getSubcommand()
            )
        ) {
            const allDeleted = await valorant.loadAccounts(user);
            if (allDeleted)
                return interaction.reply({
                    content:
                        "**😲 Your accounts were removed from the database, because their login expired. Please login again!**\n</valorant login:1172402671345467485>",
                    ephemeral: true,
                });
        }

        if (
            neededAuth.includes(options.getSubcommand()) &&
            options.getSubcommand() !== "login" &&
            valorant.accounts.get(user.id)!.size < 1
        )
            return interaction.reply({
                content:
                    "**To use this Valorant Feature, you need to login at least to one account. use**\n</valorant login:1172402671345467485>",
                ephemeral: true,
            });

        switch (options.getSubcommand()) {
            case "login":
                await valorant.auth.login(interaction);
                break;
            case "logout":
                await valorant.auth.logout(interaction);
                break;
            case "daily":
                await valorant.shop.daily(interaction);
                break;
            case "privacy": {
                await valorant.privacy(interaction);
                break;
            }
            case "agents": {
                const agentId = options.getString("valorant_agent_name", true);
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
                const skinId = options.getString("valorant_skin_name", true);
                const skin = valorant.skins.getByID(skinId);
                if (!skin)
                    return interaction.reply({
                        content: "**😲 Skin not found!**",
                        ephemeral: true,
                    });
                const skinInfo = valorant.skins.info(skin);
                await valorant.util.createSkinCollectors(interaction, skinInfo);
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
