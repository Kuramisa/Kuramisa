import { AbstractEvent, Event } from "classes/Event";
import { Interaction } from "discord.js";

@Event({
    event: "interactionCreate",
    description: "Manage VALORANT autocomplete for possessions",
})
export default class YourValorantAutocomplete extends AbstractEvent {
    async run(interaction: Interaction) {
        if (!interaction.isAutocomplete()) return;
        if (interaction.commandName !== "valorant") return;
        if (!interaction.inCachedGuild()) return;

        const {
            games: { valorant },
        } = this.client;

        const { options } = interaction;

        const { name, value } = options.getFocused(true);

        switch (name) {
            case "valorant_agent": {
                let agents = valorant.agents.all.sort((a, b) =>
                    a.displayName.localeCompare(b.displayName)
                );

                if (value.length > 0)
                    agents = agents.filter((agent) =>
                        agent.displayName
                            .toLowerCase()
                            .includes(value.toLowerCase())
                    );

                agents = agents.slice(0, 25);

                return interaction.respond(
                    agents.map((agent) => ({
                        name: `${agent.displayName} (${agent.role.displayName})`,
                        value: agent.displayName.toLowerCase(),
                    }))
                );
            }
        }
    }
}
