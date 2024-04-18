import {
    InteractionHandler,
    InteractionHandlerTypes
} from "@sapphire/framework";
import { type AutocompleteInteraction } from "discord.js";
import { camelCase, capitalize, startCase } from "lodash";

export class LogsACHandler extends InteractionHandler {
    constructor(
        ctx: InteractionHandler.LoaderContext,
        opts: InteractionHandler.Options
    ) {
        super(ctx, {
            ...opts,
            interactionHandlerType: InteractionHandlerTypes.Autocomplete
        });
    }

    override async run(
        interaction: AutocompleteInteraction,
        result: InteractionHandler.ParseResult<this>
    ) {
        return interaction.respond(result);
    }

    override async parse(interaction: AutocompleteInteraction) {
        if (interaction.commandName !== "logs") return this.none();

        const { guild } = interaction;

        if (!guild) return this.none();

        const { database } = this.container;
        const { options } = interaction;

        const db = await database.guilds.fetch(guild.id);

        const focused = options.getFocused();

        if (options.getSubcommand() === "toggles") {
            let toggles = Object.keys(db.logs.types).map(startCase);
            console.log(toggles);

            if (focused.length > 0)
                toggles = toggles.filter((toggle) =>
                    toggle.startsWith(focused)
                );

            toggles = toggles.slice(0, 25);

            return this.some(
                toggles.map((choice) => ({
                    name: choice,
                    value: camelCase(choice)
                }))
            );
        }

        return this.none();
    }
}
