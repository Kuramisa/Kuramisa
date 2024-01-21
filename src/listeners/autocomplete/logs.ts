import { Listener } from "@sapphire/framework";
import { AutocompleteInteraction } from "discord.js";
import _ from "lodash";

export class LogsACListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "Logs Autocomplete",
            event: "interactionCreate",
        });
    }

    async run(interaction: AutocompleteInteraction) {
        if (!interaction.isAutocomplete()) return;
        if (interaction.commandName !== "logs") return;
        if (!interaction.inCachedGuild()) return;

        const { database } = this.container;
        const { options, guild } = interaction;

        const db = await database.guilds.fetch(guild.id);

        const focused = options.getFocused();

        switch (options.getSubcommand()) {
            case "toggles": {
                let toggles = Object.keys(db.logs.types).map((string) =>
                    string.split(/(?=[A-Z])/).join(" ")
                );

                if (focused.length > 0)
                    toggles = toggles.filter((toggle) =>
                        toggle.startsWith(focused)
                    );

                toggles = toggles.slice(0, 25);

                return await interaction.respond(
                    toggles.map((choice) => ({
                        name: _.capitalize(choice),
                        value: choice.split(" ").join(""),
                    }))
                );
            }
        }
    }
}
