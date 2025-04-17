import {
    InteractionHandler,
    InteractionHandlerTypes,
} from "@sapphire/framework";
import type { AutocompleteInteraction } from "discord.js";

export default class AutoRoleAutocomplete extends InteractionHandler {
    constructor(context: InteractionHandler.LoaderContext) {
        super(context, {
            interactionHandlerType: InteractionHandlerTypes.Autocomplete,
        });
    }

    async run(
        interaction: AutocompleteInteraction,
        roles: InteractionHandler.ParseResult<this>,
    ) {
        await interaction.respond(
            roles.map((role) => ({
                name: role.name,
                value: role.id,
            })),
        );
    }

    async parse(interaction: AutocompleteInteraction) {
        if (interaction.commandName !== "auto-role") return this.none();
        if (!interaction.inCachedGuild()) return this.none();

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

        if (rolesStr.length < 1) return this.none();
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

        return this.some(roles);
    }
}
