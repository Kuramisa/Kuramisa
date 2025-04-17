import { AbstractEvent, Event } from "classes/Event";
import type { Interaction } from "discord.js";

@Event({
    event: "interactionCreate",
    description: "Manage Autorole autocomplete",
})
export default class AutoRoleAutocomplete extends AbstractEvent {
    async run(interaction: Interaction) {
        if (!interaction.isAutocomplete()) return;
        if (interaction.commandName !== "autorole") return;
        if (!interaction.inCachedGuild()) return;

        const {
            client: { managers },
            options,
            guild,
        } = interaction;

        const db = await managers.guilds.get(guild.id);

        const { autorole } = db;

        const value = options.getFocused();

        let rolesStr = autorole.filter((role) =>
            role.toLowerCase().includes(value.toLowerCase()),
        );

        if (rolesStr.length < 1) return;
        if (rolesStr.length > 25) rolesStr = rolesStr.slice(0, 25);

        const roles = [];

        for (const roleStr of rolesStr) {
            const role =
                guild.roles.cache.find((r) => r.name === roleStr) ??
                guild.roles.cache.get(roleStr) ??
                (await guild.roles.fetch(roleStr).catch(() => null));

            if (!role) continue;

            roles.push(role);
        }

        await interaction.respond(
            roles.map((role) => ({
                name: role.name,
                value: role.id,
            })),
        );
    }
}
