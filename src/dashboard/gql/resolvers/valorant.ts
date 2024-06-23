import kuramisa from "@kuramisa";
import { GraphQLError } from "graphql";

export default {
    Query: {
        weapons: () => {
            return kuramisa.games.valorant.weapons.all.map((wp) => {
                const { skins, ...weapon } = wp;
                return weapon;
            });
        },
        weapon: (
            _: any,
            {
                weaponUuid,
                withSkins
            }: { weaponUuid: string; withSkins: boolean }
        ) => {
            const weapon = kuramisa.games.valorant.weapons.getByID(weaponUuid);
            if (!weapon) return null;
            if (withSkins) return weapon;
            const { skins, ...weaponWithoutSkins } = weapon;
            return weaponWithoutSkins;
        },
        skins: (
            _: any,
            {
                weaponUuid,
                sortAlphabetically = false
            }: { weaponUuid: string; sortAlphabetically: boolean }
        ) => {
            const weapon = kuramisa.games.valorant.weapons.getByID(weaponUuid);
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
        skin: (_: any, { skinUuid }: { skinUuid: string }) => {
            const skin = kuramisa.games.valorant.skins.getByID(skinUuid);
            if (!skin) return null;
            return skin;
        },
        dailyStore: async (
            _: any,
            { auth: authData, userId }: { auth?: string; userId?: string }
        ) => {
            const {
                database,
                dashboard: { auth },
                games: { valorant }
            } = kuramisa;

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

            let user = kuramisa.users.cache.get(userId);
            if (!user) user = await kuramisa.users.fetch(userId);
            if (!user) throw new GraphQLError("User not found");

            if (!valorant.accounts.get(userId)) {
                const allDeleted = await valorant.loadAccounts(userId);
                if (allDeleted)
                    throw new GraphQLError(
                        "Your accounts were removed from the database, because their login expired"
                    );
            }

            if (valorant.accounts.get(userId)!.size < 1)
                throw new GraphQLError("You are not logged in to any accounts");

            const accounts = valorant.accounts.get(userId);

            if (!accounts)
                throw new GraphQLError("You are not logged in to any accounts");

            if (accounts.size === 0)
                throw new GraphQLError("You are not logged in to any accounts");

            const store = [];

            for (let i = 0; i < accounts.size; i++) {
                const account = accounts.at(i);
                if (!account) continue;
                const expired = account.auth.getExpirationDate() < Date.now();
                if (expired) await account.auth.refresh();

                const { auth } = account;

                const storeRequest = await auth.Store.StoreFront.get(
                    account.player.sub
                );

                if (!storeRequest) continue;

                const {
                    SkinsPanelLayout: {
                        SingleItemStoreOffers: offers,
                        SingleItemOffersRemainingDurationInSeconds: seconds
                    }
                } = storeRequest.data;

                const {
                    data: { Identity: identity }
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
                        contentTier
                    });
                }

                store.push({
                    account: {
                        name: account.player.acct.game_name,
                        tag: account.player.acct.tag_line,
                        card,
                        title
                    },
                    seconds,
                    offers: offerArr
                });
            }

            return store;
        }
    }
};
