import {
    InteractionHandler,
    InteractionHandlerTypes,
} from "@sapphire/framework";
import type { AutocompleteInteraction } from "discord.js";
import camelCase from "lodash/camelCase";
import startCase from "lodash/startCase";

export default class LogsAutocomplete extends InteractionHandler {
    constructor(context: InteractionHandler.LoaderContext) {
        super(context, {
            interactionHandlerType: InteractionHandlerTypes.Autocomplete,
        });
    }

    async run(interaction: AutocompleteInteraction, toggles: string[]) {
        await interaction.respond(
            toggles.map((toggle) => ({
                name: toggle,
                value: camelCase(toggle),
            })),
        );
    }

    async parse(interaction: AutocompleteInteraction) {
        if (interaction.commandName !== "logs") return this.none();
        if (!interaction.inCachedGuild()) return this.none();

        const {
            guildId,
            client: { managers },
        } = interaction;

        const guild = await managers.guilds.get(guildId);

        const { options } = interaction;
        const focused = options.getFocused();

        let toggles = Object.keys(guild.logs.types).map(startCase);

        if (focused.length > 0)
            toggles = toggles.filter((t) =>
                t.toLowerCase().includes(focused.toLowerCase()),
            );

        toggles = toggles.slice(0, 25);

        return this.some(toggles);
    }
}
