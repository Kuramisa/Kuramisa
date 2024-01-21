import { Command } from "@sapphire/framework";

export class WarframeCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "warframe",
            description: "Warframe Helper",
        });
    }

    override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addSubcommand((command) =>
                    command
                        .setName("market")
                        .setDescription("Access Warframe.market")
                        .addStringOption((option) =>
                            option
                                .setName("item")
                                .setDescription("Item to search")
                                .setAutocomplete(true)
                                .setRequired(true)
                        )
                        .addStringOption((option) =>
                            option
                                .setName("user_status")
                                .setDescription(
                                    "Status for the user that placed the order"
                                )
                                .addChoices(
                                    { name: "In Game", value: "ingame" },
                                    { name: "On Site", value: "online" }
                                )
                        )
                )
        );
    }

    /**
     * Execute Slash Command
     */
    chatInputRun = (interaction: Command.ChatInputCommandInteraction) => {
        const { options } = interaction;

        const {
            games: { warframe },
        } = this.container;

        switch (options.getSubcommand()) {
            case "market":
                warframe.orders(interaction);
                break;
        }
    };
}
