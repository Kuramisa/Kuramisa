import {
    InteractionHandler,
    InteractionHandlerTypes
} from "@sapphire/framework";
import {
    type ApplicationCommandOptionChoiceData,
    type AutocompleteInteraction
} from "discord.js";
import { startCase } from "lodash";

export class ValorantACHandler extends InteractionHandler {
    constructor(
        ctx: InteractionHandler.LoaderContext,
        opts: InteractionHandler.Options
    ) {
        super(ctx, {
            ...opts,
            interactionHandlerType: InteractionHandlerTypes.Autocomplete
        });
    }

    override async run(
        interaction: AutocompleteInteraction,
        result: InteractionHandler.ParseResult<this>
    ) {
        return interaction.respond(result);
    }

    override async parse(interaction: AutocompleteInteraction) {
        if (interaction.commandName !== "valorant") return this.none();

        const { options, user } = interaction;

        const {
            client,
            database,
            games: { valorant }
        } = this.container;

        if (!valorant.initialized) return this.none();

        const focused = options.getFocused(true);

        switch (focused.name) {
            case "your_val_account": {
                if (!valorant.accounts.get(user.id))
                    await valorant.loadAccounts(user.id);
                const accounts = valorant.accounts.get(user.id);
                if (!accounts || accounts.size === 0) return this.none();

                return this.some(
                    accounts.map((acc) => ({
                        name: `${acc.player.acct.game_name}#${acc.player.acct.tag_line} (${acc.username})`,
                        value: acc.username
                    }))
                );
            }
            case "your_wishlist_skin": {
                const db = await database.users.fetch(user.id);
                const wishlist = [];

                for (const skin of db.valorant.wishlist) {
                    if (skin.type !== "skin") continue;
                    const skinData = valorant.skins.getByID(skin.uuid);
                    if (!skinData) continue;

                    wishlist.push(skinData);
                }

                return this.some(
                    wishlist.map((skin) => ({
                        name: skin.displayName,
                        value: skin.uuid
                    }))
                );
            }
            case "your_wishlist_buddy": {
                const db = await database.users.fetch(user.id);
                const wishlist = [];

                for (const buddy of db.valorant.wishlist) {
                    if (buddy.type !== "buddy") continue;
                    const buddyData = valorant.buddies.getByID(buddy.uuid);
                    if (!buddyData) continue;

                    wishlist.push(buddyData);
                }

                return this.some(
                    wishlist.map((buddy) => ({
                        name: buddy.displayName,
                        value: buddy.uuid
                    }))
                );
            }
            case "your_wishlist_card": {
                const db = await database.users.fetch(user.id);
                const wishlist = [];

                for (const card of db.valorant.wishlist) {
                    if (card.type !== "card") continue;
                    const cardData = valorant.playerCards.getByID(card.uuid);
                    if (!cardData) continue;

                    wishlist.push(cardData);
                }

                return this.some(
                    wishlist.map((card) => ({
                        name: card.displayName,
                        value: card.uuid
                    }))
                );
            }
            case "your_wishlist_spray": {
                const db = await database.users.fetch(user.id);
                const wishlist = [];

                for (const spray of db.valorant.wishlist) {
                    if (spray.type !== "spray") continue;
                    const sprayData = valorant.sprays.getByID(spray.uuid);
                    if (!sprayData) continue;

                    wishlist.push(sprayData);
                }

                return this.some(
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
                if (agents.length === 0) return this.none();

                agents = agents.slice(0, 25);

                return this.some(
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
                if (skins.length === 0) return this.none();

                skins = skins.slice(0, 25);

                return this.some(
                    skins.map((skin) => ({
                        name: skin.displayName,
                        value: skin.uuid
                    }))
                );
            }
            case "valorant_skin_name_wishlist": {
                const db = await database.users.fetch(user.id);

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
                if (skins.length === 0) return this.none();

                skins = skins.slice(0, 25);

                return this.some(
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
                if (buddies.length === 0) return this.none();

                buddies = buddies.slice(0, 25);

                return this.some(
                    buddies.map((buddy) => ({
                        name: buddy.displayName,
                        value: buddy.uuid
                    }))
                );
            }
            case "valorant_buddy_name_wishlist": {
                const db = await database.users.fetch(user.id);

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

                if (buddies.length === 0) return this.none();

                buddies = buddies.slice(0, 25);

                return this.some(
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
                if (cards.length === 0) return this.none();

                cards = cards.slice(0, 25);

                return this.some(
                    cards.map((card) => ({
                        name: card.displayName,
                        value: card.uuid
                    }))
                );
            }
            case "valorant_card_name_wishlist": {
                const db = await database.users.fetch(user.id);

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
                if (cards.length === 0) return this.none();

                cards = cards.slice(0, 25);

                return this.some(
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
                if (sprays.length === 0) return this.none();

                sprays = sprays.slice(0, 25);

                return this.some(
                    sprays.map((spray) => ({
                        name: spray.displayName,
                        value: spray.uuid
                    }))
                );
            }
            case "valorant_spray_name_wishlist": {
                const db = await database.users.fetch(user.id);

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
                if (sprays.length === 0) return this.none();

                sprays = sprays.slice(0, 25);

                return this.some(
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
                if (weapons.length === 0) return this.none();

                weapons = weapons.slice(0, 25);

                return this.some(
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
                        value: user.id
                    });
                }

                opts = opts.filter((opt) =>
                    opt.name
                        .toLowerCase()
                        .startsWith(focused.value.toLowerCase())
                );

                return this.some(opts.slice(0, 25));
                break;
            }
            case "valorant_privacy_setting": {
                const db = await database.users.fetch(user.id);
                const privacy = db.valorant.privacy;

                return this.some(
                    Object.keys(privacy)
                        .sort((a, b) => a.localeCompare(b))
                        .map((key) => ({
                            name: startCase(key),
                            value: key
                        }))
                );
            }
            default:
                return this.none();
        }
    }
}
