import {
    InteractionHandler,
    InteractionHandlerTypes
} from "@sapphire/framework";
import { type AutocompleteInteraction } from "discord.js";

export class AutoRoleACHandler extends InteractionHandler {
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
        if (interaction.commandName !== "autorole") return this.none();

        const { guild } = interaction;
        if (!guild) return this.none();

        const { database } = this.container;
        const { options } = interaction;

        const db = await database.guilds.fetch(guild.id);
        const focused = options.getFocused(true);

        if (focused.name === "role_to_remove") {
            let roles = db.autorole.map((role) => guild.roles.cache.get(role));

            if (focused.value.length > 1)
                roles = roles.filter((role) =>
                    role?.name
                        .toLowerCase()
                        .startsWith(focused.value.toLowerCase())
                );

            roles = roles.slice(0, 25);

            return this.some(
                roles.map((role) => ({
                    name: role?.name ?? "Unknown Role",
                    value: role?.id ?? ""
                }))
            );
        }

        return this.none();
    }
}
