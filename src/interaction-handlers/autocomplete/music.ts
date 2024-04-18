import {
    InteractionHandler,
    InteractionHandlerTypes
} from "@sapphire/framework";
import { AutocompleteInteraction } from "discord.js";

export class MusicACHandler extends InteractionHandler {
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
        console.log("test");
        if (interaction.commandName !== "music") return this.none();

        const { options } = interaction;

        const focused = options.getFocused(true);

        if (focused.name === "track_or_playlist_url") {
            return this.some([
                {
                    name: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    value: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                }
            ]);
        }

        return this.none();
    }
}
