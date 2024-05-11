import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { Interaction } from "discord.js";
import { camelCase, startCase } from "lodash";

@KEvent({
    event: "interactionCreate",
    description: "Manage logs autocomplete interaction."
})
export default class LogsAutocomplete extends AbstractKEvent {
    async run(interaction: Interaction) {
        if (!interaction.isAutocomplete()) return;
        if (interaction.commandName !== "logs") return;
        if (!interaction.guildId) return;

        const { managers } = this.client;
        const { options } = interaction;

        const guild = await managers.guilds.get(interaction.guildId);
        const focused = options.getFocused();

        if (options.getSubcommand() === "toggles") {
            let toggles = Object.keys(guild.logs.types).map(startCase);

            if (focused.length > 0)
                toggles = toggles.filter((t) =>
                    t.toLowerCase().includes(focused.toLowerCase())
                );

            toggles = toggles.slice(0, 25);

            return interaction.respond(
                toggles.map((toggle) => ({
                    name: toggle,
                    value: camelCase(toggle)
                }))
            );
        }
    }
}
