import { Listener } from "@sapphire/framework";
import { AutocompleteInteraction, type GuildBasedChannel } from "discord.js";

export class DVCACListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "Dynamic Voice Channel Autocompletes",
            event: "interactionCreate"
        });
    }

    async run(interaction: AutocompleteInteraction) {
        if (!interaction.isAutocomplete()) return;
        if (interaction.commandName !== "dvc") return;
        if (!interaction.inCachedGuild()) return;

        const { database } = this.container;
        const { guild, options } = interaction;

        const db = await database.guilds.fetch(guild.id);

        const focused = options.getFocused(true);

        if (focused.name === "channel_to_undo") {
            let channels = db.dvc.map(
                (vc) =>
                    guild.channels.cache.get(vc.parentId) as GuildBasedChannel
            );

            if (focused.value.length > 0)
                channels = channels.filter((ch) =>
                    ch.name
                        .toLowerCase()
                        .startsWith(focused.value.toLowerCase())
                );

            channels = channels.slice(0, 25);

            return interaction.respond(
                channels.map((ch) => ({ name: ch.name, value: ch.id }))
            );
        }
    }
}
