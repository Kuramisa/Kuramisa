import {
    InteractionHandler,
    InteractionHandlerTypes
} from "@sapphire/framework";
import { type AutocompleteInteraction } from "discord.js";

export class DVCACHandler extends InteractionHandler {
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
        if (interaction.commandName !== "dvc") return this.none();

        const { guild } = interaction;
        if (!guild) return this.none();

        const { database } = this.container;
        const { options } = interaction;

        const db = await database.guilds.fetch(guild.id);
        const focused = options.getFocused(true);

        if (focused.name === "channel_to_undo") {
            let channels = db.dvc.map((vc) =>
                guild.channels.cache.get(vc.parentId)
            );

            if (focused.value.length > 0)
                channels = channels.filter((ch) =>
                    ch?.name
                        .toLowerCase()
                        .startsWith(focused.value.toLowerCase())
                );

            channels = channels.slice(0, 25);

            return this.some(
                channels.map((ch) => ({
                    name: ch?.name ?? "Unknown Channel",
                    value: ch?.id ?? ""
                }))
            );
        }

        return this.none();
    }
}
