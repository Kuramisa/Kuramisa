import { Listener } from "@sapphire/framework";
import type {
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
} from "discord.js";
import _ from "lodash";

export class ValorantAutocomplete extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "valorantAutocomplete",
            event: "interactionCreate",
        });
    }

    async run(interaction: AutocompleteInteraction) {
        if (!interaction.isAutocomplete()) return;
        if (interaction.commandName !== "valorant") return;

        const { options, user } = interaction;

        const {
            client,
            database,
            games: { valorant },
        } = this.container;

        if (!valorant.initialized) return;

        const focused = options.getFocused(true);

        switch (focused.name) {
            case "your_val_account": {
                if (!valorant.accounts.get(user.id))
                    await valorant.loadAccounts(user.id);
                const accounts = valorant.accounts.get(user.id);
                if (!accounts || accounts.size === 0) return;

                return interaction.respond(
                    accounts.map((acc) => ({
                        name: `${acc.player.acct.game_name}#${acc.player.acct.tag_line} (${acc.username})`,
                        value: acc.username,
                    }))
                );
            }
            case "valorant_agent_name": {
                let agents = valorant.agents.all.sort((a, b) =>
                    a.displayName.localeCompare(b.displayName)
                );
                if (focused.value.length > 0)
                    agents = agents.filter((agent) =>
                        agent.displayName
                            .toLowerCase()
                            .includes(focused.value.toLowerCase())
                    );
                if (agents.length === 0) return;

                agents = agents.slice(0, 25);

                return interaction.respond(
                    agents.map((agent) => ({
                        name: `${agent.displayName} (${agent.role.displayName})`,
                        value: agent.uuid,
                    }))
                );
            }
            case "valorant_skin_name": {
                let skins = valorant.skins.all.sort((a, b) =>
                    a.displayName.localeCompare(b.displayName)
                );
                if (focused.value.length > 0)
                    skins = skins.filter((skin) =>
                        skin.displayName
                            .toLowerCase()
                            .includes(focused.value.toLowerCase())
                    );
                if (skins.length === 0) return;

                skins = skins.slice(0, 25);

                return interaction.respond(
                    skins.map((skin) => ({
                        name: skin.displayName,
                        value: skin.uuid,
                    }))
                );
            }
            case "valorant_weapon_name": {
                let weapons = valorant.weapons.all.sort((a, b) =>
                    a.shopData?.category.localeCompare(b.shopData?.category)
                );

                if (focused.value.length > 0)
                    weapons = weapons.filter((weapon) =>
                        `${weapon.displayName} (${
                            weapon.shopData?.category ?? "Melee"
                        })`
                            .toLowerCase()
                            .includes(focused.value.toLowerCase())
                    );
                if (weapons.length === 0) return;

                weapons = weapons.slice(0, 25);

                return interaction.respond(
                    weapons.map((weapon) => ({
                        name: `${weapon.displayName} (${
                            weapon.shopData?.category ?? "Melee"
                        })`,
                        value: weapon.uuid,
                    }))
                );
            }
            case "valorant_player": {
                const accounts = valorant.accounts.filter(
                    (accs) => accs.size > 0
                );

                let opts: ApplicationCommandOptionChoiceData[] = [];

                for (const [userId, account] of accounts) {
                    let user = client.users.cache.get(userId);
                    if (!user)
                        user = await client.users
                            .fetch(userId)
                            .catch(() => undefined);
                    if (!user) continue;

                    const accountNames = account.map(
                        (acc) =>
                            `${acc.player.acct.game_name}#${acc.player.acct.tag_line}`
                    );

                    opts.push({
                        name: `${user.username} - (${accountNames.join(", ")})`,
                        value: user.id,
                    });
                }

                opts = opts.filter((opt) =>
                    opt.name
                        .toLowerCase()
                        .startsWith(focused.value.toLowerCase())
                );

                await interaction.respond(opts.slice(0, 25));
                break;
            }
            case "valorant_privacy_setting": {
                const db = await database.users.fetch(user.id);
                const privacy = db.valorant.privacy;

                return interaction.respond(
                    Object.keys(privacy)
                        .sort((a, b) => a.localeCompare(b))
                        .map((key) => ({
                            name: _.startCase(key),
                            value: key,
                        }))
                );
            }
        }
    }
}
