import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { Interaction, Role } from "discord.js";

@KEvent({
    event: "interactionCreate",
    description: "Manage Autorole autocomplete interaction"
})
export default class AutoroleAutocomplete extends AbstractKEvent {
    async run(interaction: Interaction) {
        if (!interaction.isAutocomplete()) return;
        if (interaction.commandName !== "autorole") return;
        if (!interaction.guildId) return;

        const { managers } = this.client;
        const { options } = interaction;

        const guild = await managers.guilds.get(interaction.guildId);
        const focused = options.getFocused(true);

        if (focused.name) {
            let roles: Role[] = [];

            for (const dbRole of guild.autorole) {
                let role: Role | null | undefined =
                    guild.roles.cache.get(dbRole);
                if (!role) role = await guild.roles.fetch(dbRole);
                if (role) roles.push(role);
            }

            if (focused.value.length > 1)
                roles = roles.filter((r) =>
                    r.name.toLowerCase().includes(focused.value.toLowerCase())
                );

            roles = roles.slice(0, 25);

            return interaction.respond(
                roles.map((role) => ({
                    name: role.name,
                    value: role.id
                }))
            );
        }
    }
}
