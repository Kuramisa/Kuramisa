import { container } from "@sapphire/pieces";
import { User } from "discord.js";
import { GraphQLError } from "graphql";

export default {
    Query: {
        weapons: () => {
            return container.games.valorant.weapons.all.map((wp) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { skins, ...weapon } = wp;
                return weapon;
            });
        },
        weapon: (
            _: any,
            {
                weaponUuid,
                withSkins,
            }: { weaponUuid: string; withSkins: boolean }
        ) => {
            const weapon = container.games.valorant.weapons.getByID(weaponUuid);
            if (!weapon) return null;
            if (withSkins) return weapon;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { skins, ...weaponWithoutSkins } = weapon;
            return weaponWithoutSkins;
        },
        skins: (
            _: any,
            {
                weaponUuid,
                sortAlphabetically = false,
            }: { weaponUuid: string; sortAlphabetically: boolean }
        ) => {
            const weapon = container.games.valorant.weapons.getByID(weaponUuid);
            if (!weapon) return null;

            let skins = weapon.skins
                .filter((skin) => !skin.displayName.includes("Standard"))
                .filter((skin) => !skin.displayName.includes("Random"))
                .filter((skin) => !skin.displayName.includes("Default"))
                .filter((skin) => skin.displayName !== "Melee");

            if (sortAlphabetically)
                skins = skins.sort((a, b) =>
                    a.displayName.localeCompare(b.displayName)
                );

            return skins;
        },
        dailyStore: async (
            _: any,
            { auth: authData, userId }: { auth?: string; userId?: string }
        ) => {
            const {
                client,
                database,
                dashboard: { auth },
                games: { valorant },
            } = container;

            if (!valorant.initialized)
                throw new GraphQLError("Valorant is not initialized");

            if (!authData)
                throw new GraphQLError(
                    "You must be logged in to view the store"
                );

            const authed = await auth.authUser(authData);

            if (!authed) throw new GraphQLError("Invalid auth token");

            if (!userId) userId = authed.id;

            if (userId !== authed.id) {
                const { valorant } = await database.users.fetch(userId);
                if (valorant.privacy.daily !== "public")
                    throw new GraphQLError(
                        "This user's daily store is private"
                    );
            }

            let user = client.users.cache.get(userId);
            if (!user) user = await client.users.fetch(userId);
            if (!user) throw new GraphQLError("User not found");

            if (!valorant.accounts.get(userId)) {
                const allDeleted = await valorant.loadAccounts(userId);
                if (allDeleted)
                    throw new GraphQLError(
                        "Your accounts were removed from the database, because their login expired. Please login again with the bot on Discord!"
                    );
            }

            if (valorant.accounts.get(userId)!.size < 1)
                throw new GraphQLError(
                    "You are not logged in to any accounts. Please login with the bot on Discord!"
                );

            const accounts = valorant.accounts.get(userId);

            if (!accounts)
                throw new GraphQLError(
                    "You do not have any accounts logged in. Please login with the bot on Discord!"
                );

            if (accounts.size === 0)
                throw new GraphQLError(
                    "You do not have any accounts logged in. Please login with the bot on Discord!"
                );

            const store = [];

            for (let i = 0; i < accounts.size; i++) {
                const account = accounts.at(i);
                if (!account) continue;
                const expired = account.auth.getExpirationDate() < Date.now();
                if (expired) await account.auth.refresh();

                const { auth } = account;

                const storeRequest = await auth.Store.getStorefront(
                    account.player.sub
                );

                if (!storeRequest) continue;

                const {
                    SkinsPanelLayout: {
                        SingleItemStoreOffers: offers,
                        SingleItemOffersRemainingDurationInSeconds: seconds,
                    },
                } = storeRequest.data;

                const {
                    data: { Identity: identity },
                } = await auth.Personalization.getPlayerLoadout(
                    account.player.sub
                );

                const { contentTiers, playerCards, playerTitles } = valorant;

                const card = playerCards.getByID(identity.PlayerCardID);
                const title = playerTitles.getByID(identity.PlayerTitleID);

                const offerArr = [];

                for (const offer of offers) {
                    const skin = valorant.skins.all.find(
                        (weapon) => offer.OfferID === weapon.levels[0].uuid
                    );

                    if (!skin) continue;

                    const contentTier = contentTiers.getByID(
                        skin.contentTierUuid
                    );

                    if (!contentTier) continue;

                    offerArr.push({
                        skin,
                        ...offer,
                        contentTier,
                    });
                }

                store.push({
                    account: {
                        name: account.player.acct.game_name,
                        tag: account.player.acct.tag_line,
                        card,
                        title,
                    },
                    seconds,
                    offers: offerArr,
                });
            }

            return store;
        },
    },
};
