import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { ApplicationCommandOptionChoiceData, Interaction } from "discord.js";
import { startCase } from "lodash";

@KEvent({
    event: "interactionCreate",
    description: "Manage Valorant autocomplete interaction."
})
export default class ValorantAutocomplete extends AbstractKEvent {
    async run(interaction: Interaction) {
        if (!interaction.isAutocomplete()) return;
        if (interaction.commandName !== "valorant") return;
        if (!interaction.guildId) return;

        const {
            managers,
            games: { valorant }
        } = this.client;

        if (!valorant.initialized) return;

        const { options, user } = interaction;

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
                        value: acc.username
                    }))
                );
            }
            case "your_wishlist_skin": {
                const db = await managers.users.fetch(user.id);
                const wishlist = [];

                for (const skin of db.valorant.wishlist) {
                    if (skin.type !== "skin") continue;
                    const skinData = valorant.skins.getByID(skin.uuid);
                    if (!skinData) continue;

                    wishlist.push(skinData);
                }

                return interaction.respond(
                    wishlist.map((skin) => ({
                        name: skin.displayName,
                        value: skin.uuid
                    }))
                );
            }
            case "your_wishlist_buddy": {
                const db = await managers.users.fetch(user.id);
                const wishlist = [];

                for (const buddy of db.valorant.wishlist) {
                    if (buddy.type !== "buddy") continue;
                    const buddyData = valorant.buddies.getByID(buddy.uuid);
                    if (!buddyData) continue;

                    wishlist.push(buddyData);
                }

                return interaction.respond(
                    wishlist.map((buddy) => ({
                        name: buddy.displayName,
                        value: buddy.uuid
                    }))
                );
            }
            case "your_wishlist_card": {
                const db = await managers.users.fetch(user.id);
                const wishlist = [];

                for (const card of db.valorant.wishlist) {
                    if (card.type !== "card") continue;
                    const cardData = valorant.playerCards.getByID(card.uuid);
                    if (!cardData) continue;

                    wishlist.push(cardData);
                }

                return interaction.respond(
                    wishlist.map((card) => ({
                        name: card.displayName,
                        value: card.uuid
                    }))
                );
            }
            case "your_wishlist_spray": {
                const db = await managers.users.fetch(user.id);
                const wishlist = [];

                for (const spray of db.valorant.wishlist) {
                    if (spray.type !== "spray") continue;
                    const sprayData = valorant.sprays.getByID(spray.uuid);
                    if (!sprayData) continue;

                    wishlist.push(sprayData);
                }

                return interaction.respond(
                    wishlist.map((spray) => ({
                        name: spray.displayName,
                        value: spray.uuid
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
                        value: agent.uuid
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
                        value: skin.uuid
                    }))
                );
            }
            case "valorant_skin_name_wishlist": {
                const db = await managers.users.fetch(user.id);

                let skins = valorant.skins.all
                    .sort((a, b) => a.displayName.localeCompare(b.displayName))
                    .filter((skin) => skin.cost !== 0)
                    .filter(
                        (skin) =>
                            !db.valorant.wishlist.some(
                                (w) => w.uuid === skin.uuid && w.type === "skin"
                            )
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
                        value: skin.uuid
                    }))
                );
            }
            case "valorant_buddy_name": {
                let buddies = valorant.buddies.all.sort((a, b) =>
                    a.displayName.localeCompare(b.displayName)
                );
                if (focused.value.length > 0)
                    buddies = buddies.filter((buddy) =>
                        buddy.displayName
                            .toLowerCase()
                            .includes(focused.value.toLowerCase())
                    );
                if (buddies.length === 0) return;

                buddies = buddies.slice(0, 25);

                return interaction.respond(
                    buddies.map((buddy) => ({
                        name: buddy.displayName,
                        value: buddy.uuid
                    }))
                );
            }
            case "valorant_buddy_name_wishlist": {
                const db = await managers.users.fetch(user.id);

                let buddies = valorant.buddies.all
                    .sort((a, b) => a.displayName.localeCompare(b.displayName))
                    //.filter((buddy) => buddy.cost !== 0)
                    .filter(
                        (buddy) =>
                            !db.valorant.wishlist.some(
                                (w) =>
                                    w.uuid === buddy.uuid && w.type === "buddy"
                            )
                    );

                if (focused.value.length > 0)
                    buddies = buddies.filter((buddy) =>
                        buddy.displayName
                            .toLowerCase()
                            .includes(focused.value.toLowerCase())
                    );

                if (buddies.length === 0) return;

                buddies = buddies.slice(0, 25);

                return interaction.respond(
                    buddies.map((buddy) => ({
                        name: buddy.displayName,
                        value: buddy.uuid
                    }))
                );
            }
            case "valorant_card_name": {
                let cards = valorant.playerCards.all.sort((a, b) =>
                    a.displayName.localeCompare(b.displayName)
                );
                if (focused.value.length > 0)
                    cards = cards.filter((card) =>
                        card.displayName
                            .toLowerCase()
                            .includes(focused.value.toLowerCase())
                    );
                if (cards.length === 0) return;

                cards = cards.slice(0, 25);

                return interaction.respond(
                    cards.map((card) => ({
                        name: card.displayName,
                        value: card.uuid
                    }))
                );
            }
            case "valorant_card_name_wishlist": {
                const db = await managers.users.fetch(user.id);

                let cards = valorant.playerCards.all
                    .sort((a, b) => a.displayName.localeCompare(b.displayName))
                    .filter(
                        (card) =>
                            !db.valorant.wishlist.some(
                                (w) => w.uuid === card.uuid && w.type === "card"
                            )
                    );

                if (focused.value.length > 0)
                    cards = cards.filter((card) =>
                        card.displayName
                            .toLowerCase()
                            .includes(focused.value.toLowerCase())
                    );
                if (cards.length === 0) return;

                cards = cards.slice(0, 25);

                return interaction.respond(
                    cards.map((card) => ({
                        name: card.displayName,
                        value: card.uuid
                    }))
                );
            }
            case "valorant_spray_name": {
                let sprays = valorant.sprays.all.sort((a, b) =>
                    a.displayName.localeCompare(b.displayName)
                );
                if (focused.value.length > 0)
                    sprays = sprays.filter((spray) =>
                        spray.displayName
                            .toLowerCase()
                            .includes(focused.value.toLowerCase())
                    );
                if (sprays.length === 0) return;

                sprays = sprays.slice(0, 25);

                return interaction.respond(
                    sprays.map((spray) => ({
                        name: spray.displayName,
                        value: spray.uuid
                    }))
                );
            }
            case "valorant_spray_name_wishlist": {
                const db = await managers.users.fetch(user.id);

                let sprays = valorant.sprays.all
                    .sort((a, b) => a.displayName.localeCompare(b.displayName))
                    .filter(
                        (spray) =>
                            !db.valorant.wishlist.some(
                                (w) =>
                                    w.uuid === spray.uuid && w.type === "spray"
                            )
                    );

                if (focused.value.length > 0)
                    sprays = sprays.filter((spray) =>
                        spray.displayName
                            .toLowerCase()
                            .includes(focused.value.toLowerCase())
                    );
                if (sprays.length === 0) return;

                sprays = sprays.slice(0, 25);

                return interaction.respond(
                    sprays.map((spray) => ({
                        name: spray.displayName,
                        value: spray.uuid
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
                        value: weapon.uuid
                    }))
                );
            }
            case "valorant_player": {
                const accounts = valorant.accounts.filter(
                    (accs) => accs.size > 0
                );

                let opts: ApplicationCommandOptionChoiceData[] = [];

                for (const [userId, account] of accounts) {
                    let user = this.client.users.cache.get(userId);
                    if (!user)
                        user = await this.client.users
                            .fetch(userId)
                            .catch(() => undefined);
                    if (!user) continue;

                    const accountNames = account.map(
                        (acc) =>
                            `${acc.player.acct.game_name}#${acc.player.acct.tag_line}`
                    );

                    opts.push({
                        name: `${user.username} - (${accountNames.join(", ")})`,
                        value: user.id
                    });
                }

                opts = opts.filter((opt) =>
                    opt.name
                        .toLowerCase()
                        .startsWith(focused.value.toLowerCase())
                );

                return interaction.respond(opts.slice(0, 25));
                break;
            }
            case "valorant_privacy_setting": {
                const db = await managers.users.fetch(user.id);
                const privacy = db.valorant.privacy;

                return interaction.respond(
                    Object.keys(privacy)
                        .sort((a, b) => a.localeCompare(b))
                        .map((key) => ({
                            name: startCase(key),
                            value: key
                        }))
                );
            }
        }
    }
}
